import React, { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import type { PortfolioResponse, PortfolioUpdate } from "@/portfolio-builder/store/usePortfolioStore"
import Modal from "../containers/modals/Modal"
import { TextArea } from "../inputs/TextArea"
import { useCloudinaryCore } from "@/lib/stores/cloudinary"
import { useUserSettings } from "@/lib/stores/user/useUserSettings"
import { useRouting } from "@/lib/hooks/routing/useRouting"
import { FileInput } from "../inputs/FileInput"
import Button from "../buttons/Buttons"
import { Textinput } from "../inputs/Textinput"
import AIAssistant from "../ai/AIAsistant"
import { getPortfolioDescriptionOptions } from "./portfolioPromptOptions"
import { toast } from "../../../context/Toastify"
import { BASE_URL } from "@/lib/utilities/syncFunctions/syncs"

type SnapshotMode = "none" | "generate" | "upload"

interface EditPortfolioModalProps {
    portfolio: PortfolioResponse | null
    isOpen: boolean
    onClose: () => void
    onSubmit: (id: string, data: PortfolioUpdate) => void
    isLoading: boolean
}


const LIVE_URL = BASE_URL


const EditPortfolioModal = ({
    portfolio,
    isOpen,
    onClose,
    onSubmit,
    isLoading,
}: EditPortfolioModalProps) => {
    const { userInfo } = useUserSettings()
    const { pathname } = useRouting()
    const { uploadFile, isLoading: cloudinaryLoading, error: cloudinaryError } = useCloudinaryCore()
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [isPublic, setIsPublic] = useState(true)
    const [snapshotMode, setSnapshotMode] = useState<SnapshotMode>("none")
    const [snapshotKey, setSnapshotKey] = useState(0)

    // Currently displayed cover image (already-saved URL, a blob preview, or a thum.io preview URL)
    const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null)

    // Staged-but-not-yet-uploaded file. Nothing is sent to Cloudinary until the
    // final "Save Changes" click, so we never end up with an uploaded image that
    // isn't attached to a saved portfolio. Both the "generate" and "upload" flows
    // resolve to a File, so only uploadFile is ever needed.
    const [pendingFile, setPendingFile] = useState<File | null>(null)
    const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null)

    const [isUploading, setIsUploading] = useState(false)
    const [isResolvingSnapshot, setIsResolvingSnapshot] = useState(false)
    const [snapshotResolveError, setSnapshotResolveError] = useState<string | null>(null)

    const portfolioSnapshot = () => {
        const portfolioThemeVariant = (portfolio?.layout as any)?.theme?.themeVariant || "system"
        const fullUrl = pathname;
        const THUM_IO_URL = `https://image.thum.io/get/${LIVE_URL}${fullUrl}/${portfolio?.slug}?theme=${portfolioThemeVariant}`
        return THUM_IO_URL
    }


    const uploadFolder = `/${userInfo?.id}/portfolios`

    const clearPending = useCallback(() => {
        setPendingFile(null)
        setSnapshotResolveError(null)
        if (previewObjectUrl) {
            URL.revokeObjectURL(previewObjectUrl)
            setPreviewObjectUrl(null)
        }
    }, [previewObjectUrl])

    useEffect(() => {
        if (portfolio) {
            setName(portfolio.name)
            setDescription(portfolio.description || "")
            setIsPublic(portfolio.is_public)
            setCoverImageUrl(portfolio.cover_image_url)
            setSnapshotMode("none")
            setSnapshotKey(0)
            clearPending()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [portfolio])

    // Revoke any lingering blob preview URL on unmount
    useEffect(() => {
        return () => {
            if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl)
        }
    }, [previewObjectUrl])

    const handleRegenerate = useCallback(() => {
        setSnapshotKey((k) => k + 1)
    }, [])

    // Fetches the generated snapshot image and resolves it to a File, so it can be
    // staged and later uploaded through the same uploadFile path as a manual upload.
    // Proxies through /api/snapshot to avoid 403 bot-protection from thum.io.
    const handleUseGeneratedSnapshot = useCallback(async () => {
        if (!portfolio) return
        const snapshotUrl = `${portfolioSnapshot()}&t=${snapshotKey}`
        setSnapshotResolveError(null)
        setIsResolvingSnapshot(true)
        try {
            const proxyUrl = `/api/snapshot?url=${encodeURIComponent(snapshotUrl)}`
            const response = await fetch(proxyUrl)
            if (!response.ok) throw new Error("Failed to fetch snapshot")
            const blob = await response.blob()
            const file = new File([blob], `${portfolio.slug}-snapshot.png`, {
                type: blob.type || "image/png",
            })
            const objectUrl = URL.createObjectURL(file)
            if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl)

            setPendingFile(file)
            setPreviewObjectUrl(objectUrl)
            setCoverImageUrl(objectUrl)
            setSnapshotMode("none")
        } catch {
            setSnapshotResolveError(
                "Couldn't load the generated snapshot. Try regenerating, or use Upload instead."
            )
        } finally {
            setIsResolvingSnapshot(false)
        }
    }, [portfolio, snapshotKey, previewObjectUrl])

    // Stages a picked file for upload at save-time, showing a local preview. No network call here.
    const handleFileSelect = useCallback((file: File | null) => {
        if (file === null) {
            clearPending()
            setCoverImageUrl(null)
            return
        }

        if (!portfolio) return

        const objectUrl = URL.createObjectURL(file)
        if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl)

        setPendingFile(file)
        setPreviewObjectUrl(objectUrl)
        setCoverImageUrl(objectUrl)
        setSnapshotMode("none")
    }, [portfolio, previewObjectUrl, clearPending])

    const handleRemoveCoverImage = useCallback(() => {
        clearPending()
        setCoverImageUrl(null)
    }, [clearPending])

    // Single save action: uploads the staged file (if any) first, then saves the
    // portfolio with the resulting URL. If the upload fails, we bail before touching
    // the portfolio, so we never save a broken reference or orphan an upload.
    const handleSubmit = useCallback(async () => {
        if (!portfolio) return

        let finalCoverUrl = coverImageUrl

        if (pendingFile) {
            setIsUploading(true)
            try {
                const res = await uploadFile({
                    file: pendingFile,
                    folder: uploadFolder,
                    public_id: `${portfolio.slug}-cover`,
                    resource_type: "image",
                    overwrite: true,
                })
                finalCoverUrl = res.secure_url
            } catch {
                // Upload failed — error is already in cloudinaryError state.
                // Stop here so we don't save the portfolio with a stale/blob URL.
                setIsUploading(false)
                return
            }
            setIsUploading(false)
        }

        onSubmit(portfolio.slug, {
            name: name.trim(),
            description: description.trim() || undefined,
            is_public: isPublic,
            cover_image_url: finalCoverUrl || undefined,
        })

        clearPending()
    }, [portfolio, coverImageUrl, pendingFile, uploadFile, uploadFolder, name, description, isPublic, onSubmit, clearPending])

    const busy = isLoading || isUploading || isResolvingSnapshot || cloudinaryLoading
    const saveLabel = isUploading || cloudinaryLoading
        ? "Uploading image..."
        : isLoading
            ? "Saving..."
            : "Save Changes"

    return (
        <Modal title="Edit Portfolio" isOpen={isOpen} onClose={onClose}>
            <div className="space-y-4 mt-4">
                <div>

                    <Textinput label="Name" required type="text" value={name} onChange={(e) => setName(e)} />
                </div>

                <div className="relative">
                    <TextArea label="Description" value={description} onChange={(e) => setDescription(e)} />
                    <div className="absolute bottom-0 right-0">
                        <AIAssistant
                            onChange={(e) => setDescription(e)}
                            options={getPortfolioDescriptionOptions(description, name)}
                            onEmptyClick={() => {
                                toast.info("Please enter a title to generate a description for your portfolio", {
                                    title: "Could not genrate a description"
                                })
                            }}
                        />
                    </div>
                </div>

                {/* Cover Image Section */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-[var(--foreground)]/80">
                        Cover Image
                    </label>

                    {/* Current cover image preview (saved, or staged-but-not-yet-uploaded) */}
                    {coverImageUrl && snapshotMode === "none" && (
                        <div className="relative rounded-lg overflow-hidden border border-[var(--foreground)]/10 h-40">
                            <img
                                src={coverImageUrl}
                                alt="Cover preview"
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                            {pendingFile && (
                                <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-medium bg-black/60 text-white rounded-md z-10">
                                    Not saved yet
                                </span>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>}
                                onClick={handleRemoveCoverImage}
                                title="Remove cover image"
                                className="absolute top-2 right-2 z-20 bg-red-500 hover:bg-red-700 text-white rounded-full p-2"
                            />
                        </div>
                    )}

                    {/* Snapshot mode selector */}
                    {snapshotMode === "none" && (
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                text="Generate Portfolio Snapshot"
                                onClick={() => {
                                    setSnapshotMode("generate")
                                    console.log(portfolioSnapshot())
                                }}
                                className="flex-1"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                text="Upload Portfolio Snapshot"
                                onClick={() => setSnapshotMode("upload")}
                                className="flex-1"
                            />
                        </div>
                    )}

                    {/* Generate snapshot mode */}
                    {snapshotMode === "generate" && (
                        <div className="space-y-3 rounded-lg border border-[var(--foreground)]/10 p-3">
                            <div className="rounded-lg overflow-hidden border border-[var(--foreground)]/10 bg-[var(--foreground)]/5 h-48 relative">
                                <img
                                    key={snapshotKey}
                                    src={`/api/snapshot?url=${encodeURIComponent(`${portfolioSnapshot()}&t=${snapshotKey}`)}`}
                                    alt="Portfolio snapshot preview"
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    text={isResolvingSnapshot ? "Loading..." : "Use This Snapshot"}
                                    onClick={handleUseGeneratedSnapshot}
                                    disabled={isResolvingSnapshot}
                                    loading={isResolvingSnapshot}
                                    className="flex-1"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    text="Regenerate"
                                    onClick={handleRegenerate}
                                    disabled={isResolvingSnapshot}
                                    className="flex-1"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    text="Cancel"
                                    onClick={() => setSnapshotMode("none")}
                                    disabled={isResolvingSnapshot}
                                />
                            </div>
                            {snapshotResolveError ? (
                                <p className="text-xs text-red-500">{snapshotResolveError}</p>
                            ) : (
                                <p className="text-xs text-[var(--foreground)]/50">
                                    This snapshot uploads when you click Save Changes below.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Upload snapshot mode */}
                    {snapshotMode === "upload" && (
                        <div className="space-y-3 rounded-lg border border-[var(--foreground)]/10 p-3">
                            <FileInput
                                value={pendingFile}
                                onChange={handleFileSelect}
                            />
                            <p className="text-xs text-[var(--foreground)]/50">
                                The image uploads when you click Save Changes below.
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    text="Cancel"
                                    onClick={() => setSnapshotMode("none")}
                                />
                            </div>
                        </div>
                    )}


                    {cloudinaryError && (
                        <p className="text-sm text-red-500">{cloudinaryError}</p>
                    )}
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--foreground)]/10">
                    <div>
                        <p className="text-sm font-medium text-[var(--foreground)]">Public Portfolio</p>
                        <p className="text-xs text-[var(--foreground)]/50">Visible to everyone on the platform</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsPublic(!isPublic)}
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${isPublic ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20"
                            }`}
                    >
                        <span
                            className={`absolute top-1 left-1 w-4 h-4 bg-[var(--background)] rounded-full transition-transform duration-200 ${isPublic ? "translate-x-5" : "translate-x-0"
                                }`}
                        />
                    </button>
                </div>

                <div className="flex gap-3 pt-2">
                    <Button
                        variant="outline"
                        size="md"
                        text="Cancel"
                        onClick={onClose}
                        disabled={busy}
                        className="flex-1"
                    />
                    <Button
                        variant="primary"
                        size="md"
                        text={saveLabel}
                        onClick={handleSubmit}
                        disabled={busy}
                        loading={isUploading || cloudinaryLoading}
                        className="flex-1"
                    />
                </div>
            </div>
        </Modal>
    )
}

export default EditPortfolioModal
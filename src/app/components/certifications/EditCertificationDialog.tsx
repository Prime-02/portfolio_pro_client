// components/certifications/EditCertificationDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { useCertifications } from "@/lib/stores/certifications/useCertifications";
import type { Certification } from "@/lib/stores/certifications/useCertifications";
import { Save, Trash2 } from "lucide-react";
import { Textinput } from "../inputs/Textinput";
import Button from "../buttons/Buttons";
import Modal from "../containers/modals/Modal";
import { DialogHeader, DialogTitle, DialogDescription } from "../ui/Dialog";
import { FileInput } from "../inputs/FileInput";
import Switch from "../inputs/Switch";
import { formatDateForInput } from "@/lib/utilities/syncFunctions/syncs";

interface EditCertificationDialogProps {
    certification: Certification;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditCertificationDialog({ certification, open, onOpenChange }: EditCertificationDialogProps) {
    const { updateCertification, isUpdating } = useCertifications();

    const [certName, setCertName] = useState(certification.certification_name);
    const [issuingOrg, setIssuingOrg] = useState(certification.issuing_organization);
    const [issueDate, setIssueDate] = useState(certification.issue_date ?? "");
    const [expirationDate, setExpirationDate] = useState(certification.expiration_date ?? "");
    const [externalUrl, setExternalUrl] = useState(certification.certificate_external_url ?? "");
    const [isPublic, setIsPublic] = useState(certification.is_public ?? true);
    const [certFile, setCertFile] = useState<File | null>(null);
    const [keepExistingFile, setKeepExistingFile] = useState(true);

    // Check if certification has an existing file
    const hasExistingFile = !!certification.certificate_internal_url;

    useEffect(() => {
        setCertName(certification.certification_name);
        setIssuingOrg(certification.issuing_organization);
        setIssueDate(formatDateForInput(certification.issue_date ?? ""));
        setExpirationDate(formatDateForInput(certification.expiration_date ?? ""));
        setExternalUrl(certification.certificate_external_url ?? "");
        setIsPublic(certification.is_public ?? true);
        setCertFile(null);
        setKeepExistingFile(true);
        console.log(JSON.stringify(certification))
    }, [certification]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!certification.id) return;

        await updateCertification(certification.id, {
            certification_name: certName || null,
            issuing_organization: issuingOrg || null,
            issue_date: issueDate || null,
            expiration_date: expirationDate || null,
            certificate_external_url: externalUrl || null,
            certificate_internal_url: certFile ?? null,
            is_public: isPublic,
        });
        onOpenChange(false);
    };

    const handleFileChange = (file: File | null) => {
        setCertFile(file);
        if (file) {
            setKeepExistingFile(false);
        }
    };

    const handleRemoveFile = () => {
        setCertFile(null);
        setKeepExistingFile(false);
    };

    const resetForm = () => {
        setCertName(certification.certification_name);
        setIssuingOrg(certification.issuing_organization);
        setIssueDate(certification.issue_date ?? "");
        setExpirationDate(certification.expiration_date ?? "");
        setExternalUrl(certification.certificate_external_url ?? "");
        setIsPublic(certification.is_public ?? true);
        setCertFile(null);
        setKeepExistingFile(true);
    };

    const getFileNameFromUrl = (url: string) => {
        const parts = url.split("/");
        return parts[parts.length - 1] || "certificate-file";
    };

    return (
        <Modal
            isOpen={open}
            onClose={() => {
                resetForm();
                onOpenChange(false);
            }}
            title={
                <DialogHeader>
                    <DialogTitle className="font-league-600 text-xl">
                        Edit Certification
                    </DialogTitle>
                    <DialogDescription>
                        Update your certification details
                    </DialogDescription>
                </DialogHeader>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <Textinput
                    label="Certification Name"
                    value={certName}
                    onChange={(e) => setCertName(e)}
                    required
                />

                <Textinput
                    label="Issuing Organization"
                    value={issuingOrg}
                    onChange={(e) => setIssuingOrg(e)}
                    required
                />

                <div className="grid grid-cols-2 gap-3">
                    <Textinput
                        type="date"
                        label="Issue Date"
                        value={issueDate}
                        onChange={(e) => setIssueDate(e)}
                    />
                    <Textinput
                        type="date"
                        label="Expiration Date"
                        value={expirationDate}
                        onChange={(e) => setExpirationDate(e)}
                    />
                </div>

                <Textinput
                    type="url"
                    label="Certificate URL (optional)"
                    placeholder="https://..."
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e)}
                />

                {/* File upload section */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Certificate File
                    </label>

                    {/* Show existing file */}
                    {hasExistingFile && keepExistingFile && !certFile && (
                        <div className="flex items-center gap-2 p-3 bg-[var(--foreground)]/5 
                                        rounded-lg border border-[var(--foreground)]/10 mb-2">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">
                                    Current file: {getFileNameFromUrl(certification.certificate_internal_url!)}
                                </p>
                                <a
                                    href={certification.certificate_internal_url!}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-[var(--accent)] hover:underline"
                                >
                                    View current file
                                </a>
                            </div>
                            <button
                                type="button"
                                onClick={handleRemoveFile}
                                className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--foreground)]/50 
                                         hover:text-red-600 transition-colors"
                                title="Remove file"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )}

                    {/* Show new file preview */}
                    {certFile && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 
                                        rounded-lg border border-green-200 mb-2">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-green-700 truncate">
                                    New file: {certFile.name}
                                </p>
                                <p className="text-xs text-green-600">
                                    {(certFile.size / 1024).toFixed(1)} KB
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setCertFile(null);
                                    setKeepExistingFile(hasExistingFile);
                                }}
                                className="p-1.5 rounded-lg hover:bg-green-100 text-green-600 
                                         hover:text-green-700 transition-colors"
                                title="Remove new file"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )}

                    {/* File input */}
                    <FileInput
                        value={certFile || certification.certificate_internal_url || ""}
                        onChange={handleFileChange}
                    />

                    {/* Help text */}
                    <p className="text-xs text-[var(--foreground)]/50 mt-1">
                        {hasExistingFile && keepExistingFile && !certFile
                            ? "A new file will replace the existing certificate file."
                            : !hasExistingFile && !certFile
                                ? "Upload a PDF, image, or document of your certificate."
                                : ""}
                    </p>
                </div>

                {/* Visibility toggle */}
                <div className="flex items-center justify-between px-3 py-2.5 rounded-xl 
                                border border-[var(--foreground)]/10">
                    <div>
                        <p className="text-sm font-medium">Public</p>
                        <p className="text-xs text-[var(--foreground)]/50">
                            Visible on your public profile
                        </p>
                    </div>
                    <Switch
                        onSwitch={() => setIsPublic(!isPublic)}
                        isSwitched={isPublic}
                    />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                            resetForm();
                            onOpenChange(false);
                        }}
                        text="Cancel"
                    />
                    <Button
                        icon={<Save size={16} />}
                        type="submit"
                        disabled={isUpdating || !certName || !issuingOrg}
                        loading={isUpdating}
                        text="Save Changes"
                    />
                </div>
            </form>
        </Modal>
    );
}
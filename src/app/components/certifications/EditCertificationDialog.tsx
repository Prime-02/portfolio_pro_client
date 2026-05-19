// components/certifications/EditCertificationDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { useCertifications } from "@/lib/stores/certifications/useCertifications";
import type { Certification } from "@/lib/stores/certifications/useCertifications";
import { Save } from "lucide-react";
import { Textinput } from "../inputs/Textinput";
import Button from "../buttons/Buttons";
import Modal from "../containers/modals/Modal";
import { DialogHeader, DialogTitle, DialogDescription } from "../ui/Dialog";

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

    useEffect(() => {
        setCertName(certification.certification_name);
        setIssuingOrg(certification.issuing_organization);
        setIssueDate(certification.issue_date ?? "");
        setExpirationDate(certification.expiration_date ?? "");
        setExternalUrl(certification.certificate_external_url ?? "");
        setIsPublic(certification.is_public ?? true);
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
            is_public: isPublic,
        });
        onOpenChange(false);
    };

    const resetForm = () => {
        setCertName(certification.certification_name);
        setIssuingOrg(certification.issuing_organization);
        setIssueDate(certification.issue_date ?? "");
        setExpirationDate(certification.expiration_date ?? "");
        setExternalUrl(certification.certificate_external_url ?? "");
        setIsPublic(certification.is_public ?? true);
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

                {/* Visibility toggle */}
                <div className="flex items-center justify-between px-3 py-2.5 rounded-xl 
                                border border-[var(--foreground)]/10">
                    <div>
                        <p className="text-sm font-medium">Public</p>
                        <p className="text-xs text-[var(--foreground)]/50">
                            Visible on your public profile
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsPublic(!isPublic)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            isPublic ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20"
                        }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                isPublic ? "translate-x-6" : "translate-x-1"
                            }`}
                        />
                    </button>
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
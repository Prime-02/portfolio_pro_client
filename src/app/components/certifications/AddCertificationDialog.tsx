
import { useState } from "react";
import { useCertifications } from "@/lib/stores/certifications/useCertifications";
import { DialogHeader, DialogTitle, DialogDescription } from "../ui/Dialog";
import { Textinput } from "../inputs/Textinput";
import Button from "../buttons/Buttons";
import Modal from "../containers/modals/Modal";
import { Plus } from "lucide-react";
import { FileInput } from "../inputs/FileInput";
import Switch from "../inputs/Switch";

interface AddCertificationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddCertificationDialog({ open, onOpenChange }: AddCertificationDialogProps) {
    const { createCertification, isCreating } = useCertifications();

    const [certName, setCertName] = useState("");
    const [issuingOrg, setIssuingOrg] = useState("");
    const [issueDate, setIssueDate] = useState("");
    const [expirationDate, setExpirationDate] = useState("");
    const [externalUrl, setExternalUrl] = useState("");
    const [isPublic, setIsPublic] = useState(true);
    const [certFile, setCertFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!certName || !issuingOrg) return;

        await createCertification({
            certification_name: certName,
            issuing_organization: issuingOrg,
            issue_date: issueDate || null,
            expiration_date: expirationDate || null,
            certificate_external_url: externalUrl || null,
            certificate_internal_url: certFile ?? null,
            is_public: isPublic,
        });

        resetForm();
        onOpenChange(false);
    };

    const resetForm = () => {
        setCertName("");
        setIssuingOrg("");
        setIssueDate("");
        setExpirationDate("");
        setExternalUrl("");
        setIsPublic(true);
        setCertFile(null);
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
                        Add Certification
                    </DialogTitle>
                    <DialogDescription>
                        Add a professional certification or credential
                    </DialogDescription>
                </DialogHeader>
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                {/* Cert name */}
                <Textinput
                    label="Certification Name"
                    placeholder="e.g., AWS Solutions Architect"
                    value={certName}
                    onChange={(e) => setCertName(e)}
                    required
                />

                {/* Issuing organization */}
                <Textinput
                    label="Issuing Organization"
                    placeholder="e.g., Amazon Web Services"
                    value={issuingOrg}
                    onChange={(e) => setIssuingOrg(e)}
                    required
                />

                {/* Dates */}
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

                {/* External URL */}
                <Textinput
                    type="url"
                    label="Certificate URL (optional)"
                    placeholder="https://..."
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e)}
                />

                {/* File upload using FileInput component */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Upload Certificate (optional)
                    </label>
                    <FileInput
                        value={certFile}
                        onChange={(file) => setCertFile(file)}
                    />
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

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={() => { resetForm(); onOpenChange(false); }}
                        text="Cancel"
                    />
                    <Button
                        type="submit"
                        disabled={!certName || !issuingOrg || isCreating}
                        loading={isCreating}
                        text="Add Certification"
                        icon={<Plus size={16} />}
                    />
                </div>
            </form>
        </Modal>
    );
}
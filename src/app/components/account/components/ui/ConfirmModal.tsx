import Button from "../../../buttons/Buttons";
import Modal from "../../../containers/modals/Modal";
import { Textinput } from "../../../inputs/Textinput";

// components/modals/ConfirmModal.tsx
export function ASConfirmModal({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmText,
    confirmVariant = "danger",
    loading = false,
    inputLabel,
    inputValue,
    onInputChange,
}: {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText: string;
    confirmVariant?: "primary" | "danger";
    loading?: boolean;
    inputLabel?: string;
    inputValue?: string;
    onInputChange?: (val: string) => void;
}) {
    return (
        <Modal isOpen={open} onClose={onClose} title={title}>
            <p className="text-sm text-(--foreground)/70">{description}</p>
            {inputLabel && onInputChange && (
                <div className="mt-4">
                    <Textinput
                        label={inputLabel}
                        value={inputValue || ""}
                        onChange={onInputChange}
                        type="password"
                        placeholder="Enter your password"
                    />
                </div>
            )}
            <div className="mt-6 flex justify-end gap-2">
                <Button
                    variant="ghost"
                    onClick={onClose}
                    disabled={loading}
                    text="Cancel"
                />
                <Button
                    variant={confirmVariant}
                    onClick={onConfirm}
                    loading={loading}
                    disabled={loading || (inputLabel ? !inputValue : false)}
                    text={confirmText}
                />
            </div>
        </Modal>
    );
}
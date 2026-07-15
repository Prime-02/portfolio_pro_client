"use client";

import { useState, useCallback, useEffect } from "react";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { useUserAccountStore } from "@/lib/stores/user/useUserAccountStore";
import { Textinput } from "../inputs/Textinput";
import Button from "../buttons/Buttons";
import { toast } from "../toastify/Toastify";
import Modal from "../containers/modals/Modal";
import { useAuthStore } from "@/lib/stores/user/useAuthStore";
import { PageHeader } from "../ui/PageHeader";
import { UserCog2Icon } from "lucide-react";


// ── Reusable Components (hard-coded, update later) ─────────────────────

function Card({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={`rounded-xl border border-(--foreground)/10 bg-(--background) p-6 ${className}`}
        >
            {children}
        </div>
    );
}

function SectionTitle({ children, className = "" }: { children: React.ReactNode, className?: string }) {
    return (
        <h2 className={`font-league-600 ${className} text-xl tracking-tight text-(--foreground)`}>
            {children}
        </h2>
    );
}

function SectionDesc({ children }: { children: React.ReactNode }) {
    return (
        <p className="mt-1 text-sm text-(--foreground)/60">{children}</p>
    );
}

function ConfirmModal({
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
                <Button variant="ghost" onClick={onClose} disabled={loading} text="Cancel" />
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

function Avatar({
    src,
    fallback,
    size = "md",
}: {
    src: string | null;
    fallback: string;
    size?: "sm" | "md" | "lg";
}) {
    const sizeClasses = {
        sm: "h-8 w-8 text-xs",
        md: "h-12 w-12 text-sm",
        lg: "h-20 w-20 text-lg",
    };
    const initials = fallback
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div
            className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-(--accent)/15 text-(--accent) font-league-600`}
        >
            {src ? (
                <img
                    src={src}
                    alt="Profile"
                    className="h-full w-full rounded-full object-cover"
                />
            ) : (
                initials
            )}
        </div>
    );
}

function Badge({
    children,
    variant = "default",
}: {
    children: React.ReactNode;
    variant?: "default" | "success" | "warning" | "danger";
}) {
    const variants = {
        default: "bg-(--foreground)/10 text-(--foreground)/70",
        success: "bg-(--accent)/15 text-(--accent)",
        warning: "bg-amber-500/15 text-amber-500",
        danger: "bg-red-500/15 text-red-500",
    };
    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]}`}
        >
            {children}
        </span>
    );
}

// ── Page Component ─────────────────────────────────────────────────────

export default function AccountSettingsPage() {

    // ── Stores ───────────────────────────────────────────────────────────
    const {
        userInfo,
        fetchUserInfo,
    } = useUserSettings();

    const {
        changePassword,
        deactivateAccount,
        reactivateAccount,
        deleteAccount,
        isChangingPassword,
        isDeactivating,
        isReactivating,
        isDeleting,
        clearErrors,
    } = useUserAccountStore();

    const { logout } = useAuthStore()

    // ── Local State ────────────────────────────────────────────────────
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [deactivateModalOpen, setDeactivateModalOpen] = useState(false);
    const [reactivateModalOpen, setReactivateModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");

    // ── Effects ────────────────────────────────────────────────────────
    useEffect(() => {
        fetchUserInfo();
    }, [fetchUserInfo]);

    useEffect(() => {
        return () => {
            clearErrors();
        };
    }, [clearErrors]);

    // ── Handlers ───────────────────────────────────────────────────────
    const handleChangePassword = useCallback(async () => {
        if (newPassword !== confirmPassword) {
            // toast.error("Passwords do not match");
            return;
        }
        const success = await changePassword({
            current_password: currentPassword,
            new_password: newPassword,
        });
        if (success) {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            toast.success("Password updated successfully");
        }
    }, [changePassword, currentPassword, newPassword, confirmPassword]);

    const handleDeactivate = useCallback(async () => {
        const success = await deactivateAccount();
        if (success) {
            setDeactivateModalOpen(false);
            toast.success("Account deactivated successfully");
            fetchUserInfo();
        }
    }, [deactivateAccount, fetchUserInfo]);

    const handleReactivate = useCallback(async () => {
        const success = await reactivateAccount();
        if (success) {
            setReactivateModalOpen(false);
            toast.success("Account reactivated successfully");
            fetchUserInfo();
        }
    }, [reactivateAccount, fetchUserInfo]);

    const handleDelete = useCallback(async () => {
        const success = await deleteAccount({ password: deletePassword });
        if (success) {
            await logout(false);
            setDeleteModalOpen(false);
            setDeletePassword("");
            toast.success("Account deleted. Redirecting...");
            setTimeout(() => {
                window.location.href = "/";
            }, 2000);
        }
    }, [deleteAccount, deletePassword]);

    // ── Derived ────────────────────────────────────────────────────────
    const fullName = [
        userInfo?.firstname,
        userInfo?.middlename,
        userInfo?.lastname,
    ]
        .filter(Boolean)
        .join(" ");

    const displayName = fullName || userInfo?.username || userInfo?.email || "";
    const isActive = userInfo?.is_active ?? true;

    const passwordMismatch =
        confirmPassword.length > 0 && newPassword !== confirmPassword;

    const canChangePassword =
        currentPassword.length > 0 &&
        newPassword.length >= 8 &&
        confirmPassword.length >= 8 &&
        !passwordMismatch;

    // ── Render ─────────────────────────────────────────────────────────
    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            {/* Header */}
            <PageHeader
                title="Account Settings"
                description="Manage your account details, security, and preferences"
                icon={<UserCog2Icon />}
            />

            {/* Profile Overview */}
            <Card className="mb-6">
                <div className="flex items-start gap-4">
                    <Avatar
                        src={userInfo?.profile_picture || null}
                        fallback={displayName}
                        size="lg"
                    />
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-league-600 text-lg text-(--foreground)">
                                {displayName}
                            </h3>
                            <Badge variant={isActive ? "success" : "warning"}>
                                {isActive ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                        <p className="mt-0.5 text-sm text-(--foreground)/60">
                            {userInfo?.email}
                        </p>
                        {userInfo?.phone_number && (
                            <p className="text-sm text-(--foreground)/50">
                                {userInfo.phone_number}
                            </p>
                        )}
                    </div>
                </div>
            </Card>

            {/* Change Password */}
            <Card className="mb-6">
                <SectionTitle>Change Password</SectionTitle>
                <SectionDesc>
                    Update your password to keep your account secure.
                </SectionDesc>

                <div className="mt-5 space-y-4">
                    <Textinput
                        label="Current Password"
                        value={currentPassword}
                        onChange={setCurrentPassword}
                        type="password"
                        placeholder="Enter current password"
                    />
                    <Textinput
                        label="New Password"
                        value={newPassword}
                        onChange={setNewPassword}
                        type="password"
                        placeholder="Minimum 8 characters"
                    />
                    <Textinput
                        label="Confirm New Password"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        type="password"
                        placeholder="Re-enter new password"
                    />

                    {passwordMismatch && (
                        <p className="text-sm text-red-500">Passwords do not match</p>
                    )}

                    <div className="flex justify-end">
                        <Button
                            onClick={handleChangePassword}
                            loading={isChangingPassword}
                            disabled={!canChangePassword}
                            text="Update Password"
                        />
                    </div>
                </div>
            </Card>

            {/* Account Status */}
            <Card className="mb-6">
                <SectionTitle>Account Status</SectionTitle>
                <SectionDesc>
                    {isActive
                        ? "Your account is currently active. You can temporarily deactivate it."
                        : "Your account is currently inactive. Reactivate it to restore access."}
                </SectionDesc>

                <div className="mt-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className={`h-2.5 w-2.5 rounded-full ${isActive ? "bg-(--accent)" : "bg-amber-500"
                                }`}
                        />
                        <span className="text-sm font-medium text-(--foreground)">
                            {isActive ? "Active" : "Inactive"}
                        </span>
                    </div>
                    <div>

                        <Button
                            variant={isActive ? "ghost" : "primary"}
                            onClick={() =>
                                isActive
                                    ? setDeactivateModalOpen(true)
                                    : setReactivateModalOpen(true)
                            }
                            loading={isDeactivating || isReactivating}
                            text={isActive ? "Deactivate Account" : "Reactivate Account"}
                        />
                    </div>
                </div>
            </Card>

            {/* Danger Zone */}
            <Card>
                <SectionTitle className="text-red-500">Danger Zone</SectionTitle>
                <SectionDesc>
                    Once you delete your account, there is no going back. This action is
                    permanent.
                </SectionDesc>

                <div className="mt-5">
                    <Button
                        variant="danger"
                        onClick={() => setDeleteModalOpen(true)}
                        className="w-full sm:w-auto"
                        text="Delete Account"
                    />
                </div>
            </Card>

            {/* Modals */}
            <ConfirmModal
                open={deactivateModalOpen}
                onClose={() => setDeactivateModalOpen(false)}
                onConfirm={handleDeactivate}
                title="Deactivate Account"
                description="Your account will be temporarily deactivated. You can reactivate it at any time by signing in."
                confirmText="Deactivate"
                confirmVariant="primary"
                loading={isDeactivating}
            />

            <ConfirmModal
                open={reactivateModalOpen}
                onClose={() => setReactivateModalOpen(false)}
                onConfirm={handleReactivate}
                title="Reactivate Account"
                description="Your account will be restored to active status."
                confirmText="Reactivate"
                confirmVariant="primary"
                loading={isReactivating}
            />

            <ConfirmModal
                open={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setDeletePassword("");
                }}
                onConfirm={handleDelete}
                title="Delete Account"
                description="This will permanently delete your account and all associated data. Please enter your password to confirm."
                confirmText="Delete Permanently"
                confirmVariant="danger"
                loading={isDeleting}
                inputLabel="Password"
                inputValue={deletePassword}
                onInputChange={setDeletePassword}
            />
        </div>
    );
}
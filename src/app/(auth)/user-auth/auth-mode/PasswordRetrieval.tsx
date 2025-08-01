"use client";
import { useSignIn } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import Button from "@/app/components/buttons/Buttons";
import { Textinput } from "@/app/components/inputs/Textinput";
import Modal from "@/app/components/containers/modals/Modal";
import { useGlobalState } from "@/app/globalStateProvider";

const PasswordRetrieval = () => {
  const {
    loading,
    setLoading,
    extendRouteWithQuery,
    searchParams,
    clearQuerryParam,
  } = useGlobalState();
  const { isLoaded, signIn } = useSignIn();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    code: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPhase, setResetPhase] = useState<"request" | "verify" | "reset">(
    "request"
  );

  // Read initial reset phase from URL query parameter
  useEffect(() => {
    const phaseFromQuery = searchParams.get("reset_phase");
    if (
      phaseFromQuery &&
      ["request", "verify", "reset"].includes(phaseFromQuery)
    ) {
      const newPhase = phaseFromQuery as "request" | "verify" | "reset";
      setResetPhase(newPhase);
      // Show modal if phase is "reset"
      setShowResetModal(newPhase === "reset");
    }
  }, [searchParams]);

  const handleChange = (field: keyof typeof formData) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("awaiting_request_code");
    setError("");
    setSuccess("");

    if (!isLoaded) {
      setError("System is not ready. Please try again.");
      return;
    }

    try {
      // Prepare password reset
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: formData.email,
      });

      setSuccess("Reset code sent to your email");
      setResetPhase("verify");
      // Update URL with new phase
      extendRouteWithQuery({ reset_phase: "verify" });
    } catch (err: any) {
      setError(
        err.errors?.[0]?.message ||
          "Failed to send reset code. Please try again."
      );
    } finally {
      setLoading("awaiting_request_code");
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    setLoading("verifying_code");
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!isLoaded) {
      setError("System is not ready. Please try again.");
      return;
    }

    try {
      // Attempt to reset password with the code
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: formData.code,
      });

      if (result.status === "needs_new_password") {
        setResetPhase("reset");
        setShowResetModal(true);
        // Update URL with new phase
        extendRouteWithQuery({ reset_phase: "reset" });
      }
    } catch (err: any) {
      setError(
        err.errors?.[0]?.message ||
          "Invalid verification code. Please try again."
      );
    } finally {
      setLoading("verifying_code");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    setLoading("resetting_password");
    e.preventDefault();
    setError("");

    if (!isLoaded) {
      setError("System is not ready. Please try again.");
      return;
    }

    try {
      // Complete the password reset
      await signIn.resetPassword({
        password: formData.password,
        signOutOfOtherSessions: true,
      });

      setSuccess(
        "Password reset successfully! You can now login with your new password."
      );
      setShowResetModal(false);
      setResetPhase("request");
      setFormData({ email: "", password: "", code: "" });

      // Clear query parameter after successful reset
      extendRouteWithQuery({ auth_mode: "login" });
    } catch (err: any) {
      setError(
        err.errors?.[0]?.message || "Password reset failed. Please try again."
      );
    } finally {
      setLoading("resetting_password");
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowResetModal(false);
    setResetPhase("request");
    setFormData((prev) => ({ ...prev, password: "" }));
    // Clear query parameter when closing modal
    clearQuerryParam();
  };

  return (
    <div className="max-w-md mx-auto p-6 rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-4">Reset Your Password</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success && <p className="text-green-500 mb-4">{success}</p>}

      {resetPhase === "request" && (
        <form onSubmit={handleRequestReset} className="space-y-4">
          <Textinput
            type="email"
            value={formData.email}
            onChange={handleChange("email")}
            className="w-full p-2 border rounded"
            label="Email Address"
            labelBgHexIntensity={1}
          />
          <Button
            type="submit"
            loading={loading.includes("awaiting_request_code")}
            disabled={loading.includes("awaiting_request_code")}
            className="w-full"
            text="Send Reset Code"
          />
        </form>
      )}

      {resetPhase === "verify" && (
        <form onSubmit={handleVerifyCode} className="space-y-4">
          <Textinput
            label="Verification Code"
            type="text"
            value={formData.code}
            onChange={handleChange("code")}
            placeholder="Enter code from your email"
            className="w-full p-2 border rounded"
            labelBgHexIntensity={1}
          />
          <Button
            type="submit"
            className="w-full"
            loading={loading.includes("verifying_code")}
            disabled={loading.includes("verifying_code")}
            text="Verify Code"
          />
        </form>
      )}

      {/* Password Reset Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={handleModalClose}
        title="Create New Password"
      >
        <div className="p-4">
          <form onSubmit={handleResetPassword} className="space-y-4">
            <Textinput
              label="New Password"
              type="password"
              value={formData.password}
              onChange={handleChange("password")}
              className="w-full p-2 border rounded"
              minLength={8}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button
              type="submit"
              className="w-full"
              loading={loading.includes("resetting_password")}
              disabled={loading.includes("resetting_password")}
              text="Reset Password"
            />
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default PasswordRetrieval;

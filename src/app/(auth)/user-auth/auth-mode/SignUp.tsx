"use client";
import Button from "@/app/components/buttons/Buttons";
import Modal from "@/app/components/containers/modals/Modal";
import { Textinput } from "@/app/components/inputs/Textinput";
import { useGlobalState } from "@/app/globalStateProvider";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const SignUp = () => {
  const {
    loading,
    setLoading,
    extendRouteWithQuery,
    clearQuerryParam,
    searchParams,
  } = useGlobalState();
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    verificationCode: "",
  });

  const [error, setError] = useState("");
  // Fixed: Check for verify_email parameter instead of create
  const verifyEmail = searchParams.get("verify_email") === "true";

  const handleChange = (field: keyof typeof formData) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Fixed: Remove problematic useEffect that creates empty signUp call
  useEffect(() => {
    if (isLoaded && !verifyEmail) {
      // Only initialize captcha container if needed
      const captchaContainer = document.getElementById("clerk-captcha");
      if (captchaContainer && captchaContainer.children.length === 0) {
        // Don't create empty signUp call - this causes issues
        // The captcha will be initialized when user actually submits the form
      }
    }
  }, [isLoaded, verifyEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading("signup_in_progress");

    if (!isLoaded) {
      setError("System is not ready. Please try again.");
      setLoading("signup_in_progress");
      return;
    }

    // Fixed: Add form validation
    if (!formData.email || !formData.username || !formData.password) {
      setError("Please fill in all fields.");
      setLoading("signup_in_progress");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setLoading("signup_in_progress");
      return;
    }

    try {
      await signUp.create({
        emailAddress: formData.email,
        username: formData.username,
        password: formData.password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      extendRouteWithQuery({ verify_email: "true" });
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Sign-up failed. Please try again.");
    } finally {
      setLoading("signup_in_progress");
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading("email_verification_in_progress");

    if (!isLoaded) {
      setError("System is not ready. Please try again.");
      setLoading("email_verification_in_progress");

      return;
    }

    // Fixed: Add validation for verification code
    if (!formData.verificationCode) {
      setError("Please enter the verification code.");
      setLoading("email_verification_in_progress");

      return;
    }

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: formData.verificationCode,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        router.push("/welcome");
      }
    } catch (err: any) {
      setError(
        err.errors?.[0]?.message || "Verification failed. Please try again."
      );
    } finally {
      setLoading("email_verification_in_progress");
    }
  };

  // Fixed: Add function to handle modal close properly
  const handleModalClose = () => {
    clearQuerryParam();
    setError("");
    // Reset verification code when closing modal
    setFormData((prev) => ({ ...prev, verificationCode: "" }));
  };

  return (
    <>
      {/* Verification Modal */}
      <Modal
        showCloseButton={false}
        closeOnBackdropClick={false}
        isOpen={verifyEmail}
        onClose={handleModalClose}
        title="Verify Your Email"
      >
        <div className="p-4">
          <p className="mb-4">
            We've sent a verification code to {formData.email}
          </p>
          <form onSubmit={handleVerify} className="space-y-4">
            <Textinput
              label="Verification Code"
              type="text"
              value={formData.verificationCode}
              onChange={handleChange("verificationCode")}
              placeholder="Enter verification code"
              className="w-full p-2 border rounded"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button
              type="submit"
              loading={loading.includes("email_verification_in_progress")}
              disabled={loading.includes("email_verification_in_progress")}
              className="w-full"
              text="Verify Email"
            />
          </form>
        </div>
      </Modal>

      {/* Sign Up Form */}
      <div className="max-w-md mx-auto p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text mb-4">Create an Account</h1>
        {error && !verifyEmail && <p className="text-red-500 mb-4">{error}</p>}

        <div
          id="clerk-captcha"
          className="mb-4 h-auto flex items-center justify-center"
        >
          {/* Clerk will inject captcha here */}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Textinput
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange("email")}
              className="w-full p-2 border rounded"
              label="Email"
              labelBgHexIntensity={1}
            />
          </div>

          <div>
            <Textinput
              type="text"
              id="username"
              value={formData.username}
              onChange={handleChange("username")}
              className="w-full p-2 border rounded"
              label="Username"
              labelBgHexIntensity={1}
            />
          </div>

          <div>
            <Textinput
              label="Password"
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange("password")}
              className="w-full p-2 border rounded"
              minLength={8}
              labelBgHexIntensity={1}
            />
          </div>
          <Button
            type="submit"
            loading={loading.includes("signup_in_progress")}
            disabled={loading.includes("signup_in_progress")}
            className="w-full"
            size="sm"
            text="Sign Up"
          />
        </form>
      </div>
    </>
  );
};

export default SignUp;

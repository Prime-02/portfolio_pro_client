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
    password: "",
    confirmPassword: "",
    verificationCode: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    verificationCode: "",
    general: "",
  });

  const verifyEmail = searchParams.get("verify_email") === "true";

  const handleChange = (field: keyof typeof formData) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  useEffect(() => {
    if (isLoaded && !verifyEmail) {
      const captchaContainer = document.getElementById("clerk-captcha");
      if (captchaContainer && captchaContainer.children.length === 0) {
        // Don't create empty signUp call
      }
    }
  }, [isLoaded, verifyEmail]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      email: "",
      password: "",
      confirmPassword: "",
      verificationCode: "",
      general: "",
    };

    if (!formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({
      email: "",
      password: "",
      confirmPassword: "",
      verificationCode: "",
      general: "",
    });

    if (!validateForm()) return;

    setLoading("signup_in_progress");

    if (!isLoaded) {
      setErrors((prev) => ({
        ...prev,
        general: "System is not ready. Please try again.",
      }));
      setLoading("");
      return;
    }

    try {
      await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      extendRouteWithQuery({ verify_email: "true" });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrors((prev) => ({ ...prev, general: err.message }));
      } else if (typeof err === "object" && err !== null && "errors" in err) {
        const errorWithErrors = err as { errors?: Array<{ message?: string }> };
        setErrors((prev) => ({
          ...prev,
          general:
            errorWithErrors.errors?.[0]?.message ||
            "Sign up failed. Please try again.",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          general: "Sign up failed. Please try again.",
        }));
      }
    } finally {
      setLoading("");
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({
      email: "",
      password: "",
      confirmPassword: "",
      verificationCode: "",
      general: "",
    });

    if (!formData.verificationCode) {
      setErrors((prev) => ({
        ...prev,
        verificationCode: "Verification code is required",
      }));
      return;
    }

    setLoading("email_verification_in_progress");

    if (!isLoaded) {
      setErrors((prev) => ({
        ...prev,
        general: "System is not ready. Please try again.",
      }));
      setLoading("");
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrors((prev) => ({ ...prev, general: err.message }));
      } else if (typeof err === "object" && err !== null && "errors" in err) {
        const errorWithErrors = err as { errors?: Array<{ message?: string }> };
        setErrors((prev) => ({
          ...prev,
          general:
            errorWithErrors.errors?.[0]?.message ||
            "Verification failed. Please try again.",
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          general: "Verification failed. Please try again.",
        }));
      }
    } finally {
      setLoading("");
    }
  };

  const handleModalClose = () => {
    clearQuerryParam();
    setErrors({
      email: "",
      password: "",
      confirmPassword: "",
      verificationCode: "",
      general: "",
    });
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
            {`We've sent a verification code to`} {formData.email}
          </p>
          <form onSubmit={handleVerify} className="space-y-4">
            <Textinput
              label="Verification Code"
              type="text"
              value={formData.verificationCode}
              onChange={handleChange("verificationCode")}
              placeholder="Enter verification code"
              className="w-full p-2 border rounded"
              error={errors.verificationCode}
            />
            {errors.general && (
              <p className="text-red-500 text-sm">{errors.general}</p>
            )}
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
        {errors.general && !verifyEmail && (
          <p className="text-red-500 mb-4">{errors.general}</p>
        )}

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
              error={errors.email}
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
              error={errors.password}
            />
          </div>
          <div>
            <Textinput
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange("confirmPassword")}
              className="w-full p-2 border rounded"
              minLength={8}
              labelBgHexIntensity={1}
              error={errors.confirmPassword}
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

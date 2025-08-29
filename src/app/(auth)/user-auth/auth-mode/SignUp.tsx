"use client";
import Button from "@/app/components/buttons/Buttons";
import { Textinput } from "@/app/components/inputs/Textinput";
import { toast } from "@/app/components/toastify/Toastify";
import { PostAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { PathUtil } from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import { useState } from "react";

const SignUp = () => {
  const {
    loading,
    setLoading,
    extendRouteWithQuery,
    clearQuerryParam,
    searchParams,
    accessToken,
    currentPath,
    checkParams,
  } = useGlobalState();

  const [verificationEmail, setVerificationEmail] = useState("");
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
    email: "",
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

  const handleEmailChange = (value: string) => {
    setVerificationEmail(value);
    // Clear email error when user starts typing
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: "" }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      password: "",
      confirmPassword: "",
      email: "",
      general: "",
    };

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const validateEmail = () => {
    if (!verificationEmail) {
      setErrors((prev) => ({ ...prev, email: "Email is required" }));
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(verificationEmail)) {
      setErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address",
      }));
      return false;
    }

    return true;
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmail()) return;

    const constructedParameter = PathUtil.buildUrlWithQuery(
      `${V1_BASE_URL}/auth/verify-email`,
      {
        email: verificationEmail,
      }
    ).slice(1);

    setLoading("verifying_email");

    try {
      const verificationRes: { message: string; email: string } =
        await PostAllData({
          url: constructedParameter,
        });

      if (verificationRes?.message) {
        toast.success(verificationRes.message);

        // Navigate to signup form with verification code
        if (verificationRes.email) {
          extendRouteWithQuery({ verify_email: "true" });
        }
      } else {
        toast.error(
          "An error occurred while verifying your email. Please check your email and if this persists, reach out to our support team.",
          {
            title: "Email Verification Error",
          }
        );
      }
    } catch (error) {
      console.error("Email verification error:", error);
      toast.error(
        "An error occurred while verifying your email. Please check your email and if this persists, reach out to our support team.",
        {
          title: "Email Verification Error",
        }
      );
    } finally {
      setLoading("verifying_email"); // Clear loading state
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({
      password: "",
      confirmPassword: "",
      email: "",
      general: "",
    });

    if (!validateForm()) return;

    setLoading("signup_in_progress");

    try {
      const signUpCode = checkParams("code");
      if (!signUpCode) {
        setErrors((prev) => ({
          ...prev,
          general:
            "Invalid signup link. Please request a new verification email.",
        }));
        return;
      }

      const signUpRes = await PostAllData({
        url: `${V1_BASE_URL}/auth/signup`,
        data: {
          code: signUpCode,
          password: formData.password,
        },
      });

      if (signUpRes) {
        toast.success(
          "Glad to have you onboard! Kindly login to get started with Portfolio Pro.",
          {
            title: "Welcome onboard",
          }
        );

        // Navigate to login page
        const newUrl = PathUtil.buildUrlWithQuery(currentPath, {
          new_user: "true",
          auth_mode: "login",
        });
        clearQuerryParam();
        window.location.href = newUrl;
      }
    } catch (error) {
      console.error("Signup error:", error);
      setErrors((prev) => ({
        ...prev,
        general:
          "An error occurred during signup. Please try again and if this persists, reach out to our support team.",
      }));
    } finally {
      setLoading("signup_in_progress"); // Clear loading state
    }
  };

  const renderVerifyEmail = () => {
    return (
      <div className="max-w-md mx-auto p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold mb-4">Verify Your Email</h1>
        <p className="opacity-65 mb-6">
          Please enter your email address to receive a verification link.
        </p>

        <form onSubmit={handleVerifyEmail} className="space-y-4">
          <div>
            <Textinput
              label="Email"
              type="email"
              id="email"
              value={verificationEmail}
              onChange={handleEmailChange}
              className="w-full p-2 border rounded"
              labelBgHexIntensity={1}
              error={errors.email}
              required
            />
          </div>

          <Button
            type="submit"
            loading={loading.includes("verifying_email")}
            disabled={loading.includes("verifying_email")}
            className="w-full"
            size="sm"
            text="Send Verification Email"
          />
        </form>
      </div>
    );
  };

  const renderSignupForm = () => {
    return (
      <div className="max-w-md mx-auto p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold mb-4">Create Your Account</h1>
        <p className="opacity-65 mb-6">
          Please set your password to complete your account setup.
        </p>

        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
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
              required
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
              required
            />
          </div>

          <Button
            type="submit"
            loading={loading.includes("signup_in_progress")}
            disabled={loading.includes("signup_in_progress")}
            className="w-full"
            size="sm"
            text="Create Account"
          />
        </form>
      </div>
    );
  };

  // Main render logic - FIXED: Now properly returns JSX
  const code = checkParams("code");

  if (code) {
    return renderSignupForm();
  } else {
    return renderVerifyEmail();
  }
};

export default SignUp;

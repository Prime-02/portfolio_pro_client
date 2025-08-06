"use client";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/app/components/buttons/Buttons";
import { Textinput } from "@/app/components/inputs/Textinput";
import { useGlobalState } from "@/app/globalStateProvider";

const Login = () => {
  const { loading, setLoading, userData } = useGlobalState();
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    verificationCode: "",
  });
  const [error, setError] = useState("");
  const [showVerification, setShowVerification] = useState(false);

  const handleChange = (field: keyof typeof formData) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    setLoading("login_in_progress");
    e.preventDefault();
    setError("");

    if (!isLoaded) {
      setError("System is not ready. Please try again.");
      return;
    }

    try {
      // Attempt to sign in
      const result = await signIn.create({
        identifier: formData.email,
        password: formData.password,
      });

      if (result.status === "complete") {
        // If MFA is not , set the active session and redirect
        await setActive({ session: result.createdSessionId });
        router.push(`/${userData?.username || "dashboard"}`); // Redirect to your dashboard or home page
      } else if (result.status === "needs_second_factor") {
        // Handle MFA if needed
        setShowVerification(true);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === "object" && err !== null && "errors" in err) {
        const errorWithErrors = err as { errors?: Array<{ message?: string }> };
        setError(
          errorWithErrors.errors?.[0]?.message ||
            "Login failed. Please try again."
        );
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading("login_in_progress");
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isLoaded) {
      setError("System is not ready. Please try again.");
      return;
    }

    try {
      // Attempt to verify the 2FA code
      const completeSignIn = await signIn.attemptSecondFactor({
        strategy: "totp",
        code: formData.verificationCode,
      });

      if (completeSignIn.status === "complete") {
        await setActive({ session: completeSignIn.createdSessionId });
        router.push(`/${userData?.username || "dashboard"}`);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else if (typeof err === "object" && err !== null && "errors" in err) {
        const errorWithErrors = err as { errors?: Array<{ message?: string }> };
        setError(
          errorWithErrors.errors?.[0]?.message ||
            "Sign up failed. Please try again."
        );
      } else {
        setError("Login failed. Please try again.");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-4">Login to Your Account</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {showVerification ? (
        // Verification form for MFA
        <form onSubmit={handleVerification} className="space-y-4">
          <Textinput
            label="Verification Code"
            type="text"
            value={formData.verificationCode}
            onChange={handleChange("verificationCode")}
            placeholder="Enter your 2FA code"
            className="w-full p-2 border rounded"
          />
          <Button type="submit" className="w-full" text="Verify Code" />
        </form>
      ) : (
        // Regular login form
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textinput
            type="text"
            value={formData.email}
            onChange={handleChange("email")}
            className="w-full p-2 border rounded"
            label="Email or Username"
            labelBgHexIntensity={1}
          />

          <Textinput
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleChange("password")}
            className="w-full p-2 border rounded"
            minLength={8}
            labelBgHexIntensity={1}
          />

          <Button
            type="submit"
            loading={loading.includes("login_in_progress")}
            disabled={loading.includes("login_in_progress")}
            className="w-full"
            text="Login"
          />
        </form>
      )}
    </div>
  );
};

export default Login;

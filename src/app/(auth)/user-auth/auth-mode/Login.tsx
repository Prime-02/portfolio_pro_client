"use client";
import { useState } from "react";
import { useUIStore } from "@/lib/stores/ui/useUIStore";
import { useRouting } from "@/lib/hooks/routing/useRouting";
import { toast } from "@/src/app/components/toastify/Toastify";
import { Textinput } from "@/src/app/components/inputs/Textinput";
import Button from "@/src/app/components/buttons/Buttons";
import { useAuthStore } from "@/lib/stores/user/useAuthStore";

const Login = () => {
  const { startLoading, stopLoading, isLoading } = useUIStore();
  const { checkParams, router } = useRouting();
  const { login } = useAuthStore()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });

  const handleChange = (field: keyof typeof formData) => (value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "email" ? value.toLowerCase() : value,
    }));

    // Clear field error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      email: "",
      password: "",
      general: "",
    };

    if (!formData.email.trim()) {
      newErrors.email = "Email or username is required";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({
      email: "",
      password: "",
      general: "",
    });

    if (!validateForm()) return;

    startLoading("login_in_progress");

    try {
      const loginRes = await login(formData.email, formData.password);

      const isNewUser = checkParams("new_user") === "true";

      // Navigate based on user status
      if (isNewUser) {
        router.push(`/${loginRes.user.username}?edit_profile=true`);
      } else {
        router.push(`/`);
      }

      toast.success("Login successful! Welcome back.", {
        title: "Login Success",
      });
    } catch (error) {
      console.error("Login error:", error);
      setErrors((prev) => ({
        ...prev,
        general: error instanceof Error
          ? error.message
          : "Login failed. Please check your credentials and try again.",
      }));
    } finally {
      stopLoading("login_in_progress");
    }
  };

  const isLoginLoading = isLoading("login_in_progress");

  return (
    <div className="max-w-md mx-auto p-6 rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-4">Login to Your Account</h1>

      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Textinput
            type="text"
            value={formData.email}
            onChange={handleChange("email")}
            className="w-full p-2 border rounded"
            label="Email"
            error={errors.email}
            required
            autoComplete="username"
          />
        </div>

        <div>
          <Textinput
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleChange("password")}
            className="w-full p-2 border rounded"
            error={errors.password}
            required
            autoComplete="current-password"
          />
        </div>

        <Button
          type="submit"
          loading={isLoginLoading}
          disabled={isLoginLoading}
          className="w-full"
          text="Login"
          size="sm"
        />
      </form>
    </div>
  );
};

export default Login;
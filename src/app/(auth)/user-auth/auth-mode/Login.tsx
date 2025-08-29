import { useState } from "react";
import Button from "@/app/components/buttons/Buttons";
import { Textinput } from "@/app/components/inputs/Textinput";
import { toast } from "@/app/components/toastify/Toastify";
import { useGlobalState } from "@/app/globalStateProvider";
import { PostAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";

const Login = () => {
  const { loading, setLoading, checkParams, setAccessToken, router } =
    useGlobalState();

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

    setLoading("login_in_progress");

    try {
      const loginRes: { session_token: string; username: string } =
        await PostAllData({
          url: `${V1_BASE_URL}/auth/login`,
          data: formData,
          useFormData: true,
        });

      if (loginRes?.session_token) {
        setAccessToken(loginRes.session_token);

        const isNewUser = checkParams("new_user") === "true";

        // Navigate based on user status
        if (isNewUser) {
          router.push("/welcome");
        } else if (!loginRes.username) {
          router.push("/welcome?step=1");
        } else {
          router.push(`/${loginRes.username}`);
        }

        toast.success("Login successful! Welcome back.", {
          title: "Login Success",
        });
      } else {
        setErrors((prev) => ({
          ...prev,
          general: "Login failed. Please check your credentials and try again.",
        }));
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading("login_in_progress"); // Clear loading state
    }
  };

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
            labelBgHexIntensity={1}
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
            labelBgHexIntensity={1}
            error={errors.password}
            required
            autoComplete="current-password"
          />
        </div>

        <Button
          type="submit"
          loading={loading.includes("login_in_progress")}
          disabled={loading.includes("login_in_progress")}
          className="w-full"
          text="Login"
          size="sm"
        />
      </form>
    </div>
  );
};

export default Login;

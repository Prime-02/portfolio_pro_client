"use client";

import { api } from "@/lib/client/api";
import { useRouting } from "@/lib/hooks/routing/useRouting";
import { useUIStore } from "@/lib/stores/ui/useUIStore";
import Button from "@/src/app/components/buttons/Buttons";
import BasicHeader from "@/src/app/components/containers/divs/header/BasicHeader";
import { Textinput } from "@/src/app/components/inputs/Textinput";
import { toast } from "@/src/app/components/toastify/Toastify";
import React, { useState } from "react";

const PasswordRetrieval = () => {
  const { isLoading, startLoading, stopLoading } = useUIStore()
  const { checkParams, router } = useRouting()
  const token = checkParams("token");
  const [email, setEmail] = useState("");
  const [resetPassword, setResetPassword] = useState({
    password: "",
    confirmPassword: "",
  });

  const requestPasswordReset = async () => {
    if (!email.includes("@")) {
      toast.error("Please enter a valid email.");
      return;
    }
    startLoading("requesting_password_reset");
    try {
      const requestRes: { message: string } = await api.post("/auth/forgotten-password", { email: email });
      if (requestRes.message) {
        toast.success(requestRes.message, {
          title: "Password Reset Requested",
        });
      }
    } catch (error) {
      console.log("Error requesting password reset:", error);
    } finally {
      stopLoading("requesting_password_reset");
    }
  };

  const resetPasswordFunc = async () => {
    if (resetPassword.password !== resetPassword.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    startLoading("resetting_password");
    try {
      const resetRes: { message: string } = await api.post("/auth/reset-password", { token: token, new_password: resetPassword.password });
      if (resetRes.message) {
        toast.success(
          `${resetRes.message}. Please login with your new credentials to access your account.`,
          {
            title: "Password Reset Successful",
          }
        );
        router.push("/user-auth?auth_mode=login");
      }
    } catch (error) {
      console.log("Error resetting password:", error);
    } finally {
      stopLoading("resetting_password");
    }
  };

  if (token) {
    return (
      <div className="flec flex-col p-3 space-y-3">
        <BasicHeader
          heading="Enter New Password"
          headingClass=" text-2xl font-semibold"
          subHeading="Please enter your new password below."
        />
        <Textinput
          label="New Password"
          type="password"
          value={resetPassword.password}
          onChange={(e) => setResetPassword({ ...resetPassword, password: e })}
          desc="Enter your new password."
        />
        <Textinput
          label="Confirm New Password"
          type="password"
          value={resetPassword.confirmPassword}
          onChange={(e) =>
            setResetPassword({ ...resetPassword, confirmPassword: e })
          }
          desc="Re-enter your new password."
        />
        <Button
          text="Reset Password"
          size="sm"
          className="w-full"
          onClick={resetPasswordFunc}
          disabled={
            isLoading("resetting_password") ||
            !resetPassword.password ||
            !resetPassword.confirmPassword ||
            resetPassword.password !== resetPassword.confirmPassword
          }
          loading={isLoading("resetting_password")}
        />
      </div>
    );
  } else {
    return (
      <div className="flec flex-col p-3 space-y-3">
        <BasicHeader
          heading="Request Password Reset"
          headingClass=" text-2xl font-semibold"
          subHeading="Enter your email to receive password reset instructions."
        />
        <div>
          <Textinput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e)}
            desc="Enter your email to receive password reset instructions."
          />
        </div>
        <Button
          text="Request Password Reset"
          size="sm"
          className="w-full"
          onClick={requestPasswordReset}
          disabled={isLoading("requesting_password_reset") || !email}
          loading={isLoading("requesting_password_reset")}
        />
      </div>
    );
  }
};

export default PasswordRetrieval;

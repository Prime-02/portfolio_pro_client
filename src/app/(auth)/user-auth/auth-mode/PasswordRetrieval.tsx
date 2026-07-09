"use client";

import { useRouting } from "@/lib/hooks/routing/useRouting";
import { useAuthStore } from "@/lib/stores/user/useAuthStore";
import Button from "@/src/app/components/buttons/Buttons";
import BasicHeader from "@/src/app/components/containers/divs/header/BasicHeader";
import { Textinput } from "@/src/app/components/inputs/Textinput";
import { toast } from "@/src/app/components/toastify/Toastify";
import React, { useState } from "react";

const PasswordRetrieval = () => {
  const { checkParams, router } = useRouting();
  const token = checkParams("token");
  const [email, setEmail] = useState("");
  const [resetPassword, setResetPassword] = useState({
    password: "",
    confirmPassword: "",
  });

  const { forgottenPassword, resetPassword: resetPasswordStore, isLoading: authLoading, error: authError } = useAuthStore();

  const requestPasswordReset = async () => {
    if (!email.includes("@")) {
      toast.error("Please enter a valid email.");
      return;
    }

    try {
      const requestRes = await forgottenPassword(email);
      if (requestRes.message) {
        toast.success(requestRes.message, {
          title: "Password Reset Requested",
        });
      }
    } catch (error) {
      console.log("Error requesting password reset:", error);
      toast.error(authError || "Failed to request password reset");
    }
  };

  const resetPasswordFunc = async () => {
    if (resetPassword.password !== resetPassword.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      // Store the token in tokenStore or pass it as needed
      // The resetPassword function in the store expects to use the current auth session
      // You may need to modify the store to accept a token parameter
      if (!token) {
        toast.error("Something went wrong, please request for a new reset link", {
          title: "Invalid or missing token"
        })
      } else {
        const resetRes = await resetPasswordStore(resetPassword.password, token);
        if (resetRes.message) {
          toast.success(
            `${resetRes.message}. Please login with your new credentials to access your account.`,
            {
              title: "Password Reset Successful",
            }
          );
          router.push("/user-auth?auth_mode=login");
        }
      }
    } catch (error) {
      console.log("Error resetting password:", error);
      toast.error(authError || "Failed to reset password");
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
            authLoading ||
            !resetPassword.password ||
            !resetPassword.confirmPassword ||
            resetPassword.password !== resetPassword.confirmPassword
          }
          loading={authLoading}
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
          disabled={authLoading || !email}
          loading={authLoading}
        />
      </div>
    );
  }
};

export default PasswordRetrieval;
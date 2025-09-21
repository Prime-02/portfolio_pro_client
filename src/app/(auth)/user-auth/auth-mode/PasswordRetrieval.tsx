"use client";
import Button from "@/app/components/buttons/Buttons";
import BasicHeader from "@/app/components/containers/divs/header/BasicHeader";
import { Textinput } from "@/app/components/inputs/Textinput";
import { toast } from "@/app/components/toastify/Toastify";
import { PostAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { useGlobalState } from "@/app/globalStateProvider";
import React, { useState } from "react";

const PasswordRetrieval = () => {
  const { loading, setLoading, checkParams, router } = useGlobalState();
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
    setLoading("requesting_password_reset");
    try {
      const requestRes: { message: string } = await PostAllData({
        access: "",
        url: `${V1_BASE_URL}/auth/forgotten-password`,
        data: { email: email },
      });
      if (requestRes.message) {
        toast.success(requestRes.message, {
          title: "Password Reset Requested",
        });
      }
    } catch (error) {
      console.log("Error requesting password reset:", error);
    } finally {
      setLoading("requesting_password_reset");
    }
  };

  const resetPasswordFunc = async () => {
    if (resetPassword.password !== resetPassword.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading("resetting_password");
    try {
      const resetRes: { message: string } = await PostAllData({
        access: String(token),
        url: `${V1_BASE_URL}/auth/reset-password`,
        data: { token: token, new_password: resetPassword.password },
      });
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
      setLoading("resetting_password");
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
          labelBgHexIntensity={1}
        />
        <Textinput
          label="Confirm New Password"
          type="password"
          value={resetPassword.confirmPassword}
          onChange={(e) =>
            setResetPassword({ ...resetPassword, confirmPassword: e })
          }
          desc="Re-enter your new password."
          labelBgHexIntensity={1}
        />
        <Button
          text="Reset Password"
          size="sm"
          className="w-full"
          onClick={resetPasswordFunc}
          disabled={
            loading.includes("resetting_password") ||
            !resetPassword.password ||
            !resetPassword.confirmPassword ||
            resetPassword.password !== resetPassword.confirmPassword
          }
          loading={loading.includes("resetting_password")}
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
            labelBgHexIntensity={1}
          />
        </div>
        <Button
          text="Request Password Reset"
          size="sm"
          className="w-full"
          onClick={requestPasswordReset}
          disabled={loading.includes("requesting_password_reset") || !email}
          loading={loading.includes("requesting_password_reset")}
        />
      </div>
    );
  }
};

export default PasswordRetrieval;

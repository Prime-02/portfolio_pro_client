import Button from "@/app/components/buttons/Buttons";
import Modal from "@/app/components/containers/modals/Modal";
import { Textinput } from "@/app/components/inputs/Textinput";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { toast } from "@/app/components/toastify/Toastify";
import { PostAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { PathUtil } from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import Image from "next/image";
import React, { FormEvent, useState } from "react";

const VercelButton = () => {
  const { isDarkMode } = useTheme();
  const {
    setLoading,
    loading,
    checkParams,
    clearQuerryParam,
    currentPath,
    router,
    currentPathWithQuery,
  } = useGlobalState();
  const tokenModal = checkParams("token_modal");
  const [token, setToken] = useState("");

  const validateToken = async (e: FormEvent<HTMLElement>) => {
    e.preventDefault();
    if (!token || token.length < 10) {
      toast.error("Invalid token");
      return;
    }
    setLoading("validating_token");
    try {
      const verificationRes: { valid: boolean } = await PostAllData({
        url: `${V1_BASE_URL}/vercel/validate-token?token=${token.trim()}`,
      });
      if (verificationRes.valid) {
        toast.success("Your vercel token has been validated. Redirecting...", {
          title: "Validation successful",
        });
        router.push(
          `${PathUtil.buildUrlWithQuery(`/user-auth/vercel`, {
            code: token,
          })}`
        );
      } else {
        toast.error(
          "Your token appears to be invalid, ensure you copied it correctly from the vercel platform, or view guide to learn more.",
          {
            title: "Validation Error",
          }
        );
      }
    } catch (error) {
      toast.error(
        "Your token could not be validated, ensure you copied it correctly from the vercel platform, or view guide to learn more.",
        {
          title: "Validation Error",
        }
      );
      console.log(error);
    } finally {
      setLoading("validating_token");
    }
  };

  return (
    <>
      <Modal
        title={"Validate Token"}
        isOpen={tokenModal ? true : false}
        onClose={() => {
          clearQuerryParam();
        }}
      >
        <form className="flex flex-col w-full gap-y-3" onSubmit={validateToken}>
          <span className="text-xs text-[var(--accent)] ">show guide</span>
          <span>
            <Textinput
              value={token}
              onChange={setToken}
              label="Vercel Token"
              type="password"
            />
          </span>
          <span className="w-full flex">
            <Button
              text="Verify & Continue"
              size="sm"
              className="w-full"
              loading={loading.includes("validating_token")}
              type="submit"
            />
          </span>
        </form>
      </Modal>
      <Button
        icon={
          <Image
            src={`/socials/vercel/vercel-icon-${isDarkMode ? "dark" : "light"}.svg`}
            width={15}
            height={15}
            alt={"Vercel Logo"}
          />
        }
        text="Continue with vercel"
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => {
          router.push(
            `${PathUtil.addQueryParams(currentPathWithQuery, {
              token_modal: "true",
              auth_mode: "login",
            })}`
          );
        }}
      />
    </>
  );
};

export default VercelButton;

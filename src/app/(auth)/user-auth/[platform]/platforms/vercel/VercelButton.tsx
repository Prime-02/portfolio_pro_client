import { api } from "@/lib/client/api";
import { useRouting } from "@/lib/hooks/routing/useRouting";
import { useUIStore } from "@/lib/stores/ui/useUIStore";
import { PathUtil } from "@/lib/utilities/syncFunctions/syncs";
import Button from "@/src/app/components/buttons/Buttons";
import Modal from "@/src/app/components/containers/modals/Modal";
import { Textinput } from "@/src/app/components/inputs/Textinput";
import { useTheme } from "@/src/context/ThemeContext";
import { toast } from "@/src/context/Toastify";
import Image from "next/image";
import React, { FormEvent, useState } from "react";
import TokenGuideDropdown from "./TokenGuideDropdown";

const VercelButton = ({ buttonText }: { buttonText?: string }) => {
  const { isDarkMode } = useTheme();
  const { startLoading, stopLoading, isLoading } = useUIStore()
  const {
    checkParams,
    clearQueryParam,
    router,
    currentPathWithQuery,
    pathname
  } = useRouting()
  const tokenModal = checkParams("token_modal");
  const [token, setToken] = useState("");

  const validateToken = async (e: FormEvent<HTMLElement>) => {
    e.preventDefault();
    if (!token || token.length < 10) {
      toast.error("Invalid token");
      return;
    }
    startLoading("validating_token");
    try {
      const { data: verificationRes } = await api.post(`/vercel/validate-token?token=${token.trim()}`);
      const onSuccess = () => {
        toast.info("Reloading")
        router.replace(pathname)
      }
      if (verificationRes.valid) {
        toast.success("Your Vercel token has been validated. You can now import your projects—newly created projects will also be automatically imported for the duration of your token's validity.", {
          title: "Validation successful",
          onClose: () => onSuccess()
        });
        onSuccess()
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
      stopLoading("validating_token");
    }
  };

  return (
    <>
      <Modal
        title={"Validate Token"}
        isOpen={tokenModal ? true : false}
        onClose={() => {
          clearQueryParam();
        }}
      >
        <form className="flex flex-col w-full gap-y-3" onSubmit={validateToken}>
          <TokenGuideDropdown />
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
              loading={isLoading("validating_token")}
              type="submit"
            />
          </span>
        </form>
      </Modal>
      <Button
        icon={
          <img
            src={`/socials/vercel/vercel-icon-${isDarkMode ? "dark" : "light"}.svg`}
            width={15}
            height={15}
            alt={"Vercel Logo"}
          />
        }
        text={buttonText ? buttonText : "Continue with vercel"}
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

import { api } from "@/lib/client/api";
import { useRouting } from "@/lib/hooks/routing/useRouting";
import { useUIStore } from "@/lib/stores/ui/useUIStore";
import { PathUtil } from "@/lib/utilities/syncFunctions/syncs";
import Button, { ButtonProps } from "@/src/app/components/buttons/Buttons";
import Modal from "@/src/app/components/containers/modals/Modal";
import { Textinput } from "@/src/app/components/inputs/Textinput";
import { useTheme } from "@/src/context/ThemeContext";
import { toast } from "@/src/context/Toastify";
import Image from "@/src/app/components/ui/Image";
import React, { FormEvent, useState } from "react";
import TokenGuideDropdown from "./TokenGuideDropdown";
import { useVercelIntegrationStore, VercelUserCreateResponse } from "@/lib/stores/linked_platforms/vercel/vercel-integration.store";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";

const VercelButton: React.FC<ButtonProps> = ({
  icon,
  text = "Continue with vercel",
  variant = "outline",
  size = "sm",
  className = "w-full",
  onClick,
  ...restProps
}) => {
  const { isDarkMode } = useTheme();
  const { userInfo } = useUserSettings()
  const { listVercelIntegrations } = useVercelIntegrationStore()
  const { startLoading, stopLoading, isLoading } = useUIStore()
  const {
    checkParams,
    clearQueryParam,
    router,
    currentPathWithQuery,
    setRedirectUrl
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
      const { data: verificationRes } = await api.post<VercelUserCreateResponse>(`/vercel/login`, {
        vercel_token: token.trim(),
        user_id: userInfo?.id
      });
      await listVercelIntegrations()
      const onSuccess = () => {
        clearQueryParam()
      }
      if (verificationRes.message) {
        toast.success(verificationRes.message, {
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

  const defaultIcon = (
    <Image
      src={`/socials/vercel/vercel-icon-${isDarkMode ? "dark" : "light"}.svg`}
      width={15}
      height={15}
      alt={"Vercel Logo"}
    />
  );

  const handleClick = () => {
    router.push(
      `${PathUtil.addQueryParams(currentPathWithQuery, {
        token_modal: "true",
        auth_mode: "login",
      })}`
    );
  };

  return (
    <>
      <Modal
        title={"Validate Token"}
        isOpen={tokenModal ? true : false}
        onClose={() => {
          clearQueryParam();
        }}
        size="sm"
        centered
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
        icon={icon || defaultIcon}
        text={text}
        variant={variant}
        size={size}
        className={className}
        onClick={onClick || handleClick}
        {...restProps}
      />
    </>
  );
};

export default VercelButton;
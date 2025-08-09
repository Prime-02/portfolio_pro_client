// components/profile/ProfileActions.tsx
import React from "react";
import Button from "@/app/components/buttons/Buttons";
import { Pen, Share2 } from "lucide-react";
import {
  copyToClipboard,
  getCurrentUrl,
} from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import { MdArrowBack } from "react-icons/md";
import { useTheme } from "@/app/components/theme/ThemeContext ";

interface ProfileActionsProps {
  onEditClick: () => void;
  className?: string;
}

const ProfileActions: React.FC<ProfileActionsProps> = ({
  onEditClick,
  className = "flex flex-wrap items-center justify-start gap-3",
}) => {
  const { currentUser, router, setCurrentUser } = useGlobalState();
  const { getUserSettings } = useTheme();

  if (currentUser) {
    return (
      <div className={className}>
        <Button
          className={className}
          onClick={() => {
            setCurrentUser(undefined);
            router.replace(`/dashboard/profile`);
            getUserSettings(undefined);
          }}
          icon={<MdArrowBack size={20} />}
          text="Return"
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <Button
        onClick={onEditClick}
        icon={<Pen size={16} />}
        text="Edit Profile"
        className="rounded-full"
        size="sm"
      />
      <Button
        onClick={() => copyToClipboard(getCurrentUrl("full"))}
        icon={<Share2 size={16} />}
        text="Share Profile"
        variant="outline"
        className="rounded-full"
        size="sm"
      />
    </div>
  );
};

export default ProfileActions;

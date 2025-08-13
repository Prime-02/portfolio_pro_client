import React from "react";
import { Heart, Share, MoreVertical, Eye, Download, Edit } from "lucide-react";

// Define the album interface to match your data structure
export interface AlbumData {
  name: string;
  description?: string;
  is_public: boolean;
  cover_media_url: string;
  created_at: string;
  updated_at: string | null;
  id?: string;
  user_id: string;
  cover_media_url_id: string;
  media_count?: number;
  // Allow for transformed props
  formattedDate?: string;
  isPublic?: boolean;
  // Allow any additional properties
  [key: string]: unknown;
}

// Example action components
export const ActionButton = ({
  icon: Icon,
  onClick,
  className = "",
  title = "",
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
  title?: string;
}) => (
  <span
    onClick={onClick}
    title={title}
    className={`p-2 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer ${className}`}
  >
    <Icon size={16} className="text-gray-700" />
  </span>
);

const ActionGroup = ({
  itemData,
  currentUser,
  onLike,
  onShare,
  onMore,
  onView,
  onDownload,
  onEdit,
}: {
  itemData: AlbumData;
  currentUser?: string | null;
  onLike: (item: AlbumData) => void;
  onShare: (item: AlbumData) => void;
  onMore: (item: AlbumData) => void;
  onView?: (item: AlbumData) => void;
  onDownload?: (item: AlbumData) => void;
  onEdit?: (item: AlbumData) => void;
}) => {
  // Actions for when currentUser exists (owner/authenticated user)
  const ownerActions = [
    {
      icon: Edit,
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit?.(itemData);
      },
      title: "Edit Album",
    },
    {
      icon: Share,
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        onShare(itemData);
      },
      title: "Share Album",
    },
    {
      icon: MoreVertical,
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        onMore(itemData);
      },
      title: "More Options",
    },
  ];

  // Actions for when currentUser doesn't exist (public/guest view)
  const guestActions = [
    {
      icon: Eye,
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        onView?.(itemData);
      },
      title: "View Album",
    },
    {
      icon: Heart,
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        onLike(itemData);
      },
      title: "Like Album",
    },
    {
      icon: Download,
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        onDownload?.(itemData);
      },
      title: "Download Album",
    },
  ];

  const actionsToRender = currentUser ? ownerActions : guestActions;

  return (
    <div className="flex gap-2">
      {actionsToRender.map((action, index) => (
        <ActionButton
          key={index}
          icon={action.icon}
          onClick={action.onClick}
          title={action.title}
        />
      ))}
    </div>
  );
};

export default ActionGroup;

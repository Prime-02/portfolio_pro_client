"use client";

import React from "react";

interface AvatarUserProps {
  username: string,
  profile_picture: string,
}

interface ProjectCommentAvatarProps {
  user?: AvatarUserProps;
  size?: "sm" | "md";
}

const SIZE_CLASSES: Record<NonNullable<ProjectCommentAvatarProps["size"]>, string> = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
};

const TEXT_SIZE_CLASSES: Record<NonNullable<ProjectCommentAvatarProps["size"]>, string> = {
  sm: "text-[10px]",
  md: "text-xs",
};

export default function ProjectCommentAvatar({ user, size = "md" }: ProjectCommentAvatarProps) {
  const initial = (user?.username || "U").charAt(0).toUpperCase();

  return (
    <div
      className={`${SIZE_CLASSES[size]} rounded-full bg-[var(--accent)]/15 flex items-center justify-center flex-shrink-0 overflow-hidden`}
    >
      {user?.profile_picture ? (
        <img
          src={user.profile_picture}
          alt={user.username || ""}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className={`${TEXT_SIZE_CLASSES[size]} font-semibold text-[var(--accent)]`}>
          {initial}
        </span>
      )}
    </div>
  );
}

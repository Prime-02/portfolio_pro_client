import { UserProfilePage } from '@/src/app/components/profile/UserProfilePage'
import React from 'react'
import type { Metadata } from "next";
import { fetchForMetadata } from "@/lib/server/fetchMetadata";
import { UserProfileRequest } from '@/lib/stores/user/useUserSettings';
import { UserResponse } from '@/lib/stores/user/useUserAccountStore';
import { mdToPlainText } from '../../components/markdown/MarkdownText';

const BASE_URL = "https://portfolio-pro-client.vercel.app";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;

  const [profile, info] = await Promise.all([
    fetchForMetadata<UserProfileRequest>(`settings/profile/${username}`),
    fetchForMetadata<UserResponse>(`settings/info/${username}`),
  ]);

  if (!profile && !info) return { title: "Profile not found" };

  const displayName =
    info?.firstname && info?.lastname
      ? `${info.firstname} ${info.lastname}`
      : username;

  const title = `${displayName}${profile?.profession ? ` — ${profile.profession}` : ""}`;
  const plainBio = profile?.bio ? mdToPlainText(profile.bio) : null;
  const imageUrl = info?.profile_picture;

  return {
    title,
    description: plainBio ?? `View ${displayName}'s portfolio on Portfolio Pro`,
    alternates: { canonical: `${BASE_URL}/${username}` },
    openGraph: {
      title,
      description: plainBio ?? `View ${displayName}'s portfolio on Portfolio Pro`,
      type: "profile",
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

const UserDashboard = async ({
  params,
}: {
  params: Promise<{ username: string }>;
}) => {
  const { username } = await params;

  const [profile, info] = await Promise.all([
    fetchForMetadata<UserProfileRequest>(`settings/profile/${username}`),
    fetchForMetadata<UserResponse>(`settings/info/${username}`),
  ]);

  const displayName =
    info?.firstname && info?.lastname
      ? `${info.firstname} ${info.lastname}`
      : username;

  const jsonLd =
    profile || info
      ? {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        mainEntity: {
          "@type": "Person",
          name: displayName,
          alternateName: username,
          description: profile?.bio,
          image: info?.profile_picture,
          jobTitle: profile?.job_title,
          url: `${BASE_URL}/${username}`,
        },
      }
      : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <UserProfilePage />
    </>
  );
};

export default UserDashboard;
import LikeCheckbox from "@/app/components/buttons/LikeCheckBox";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { ProjectEngagementData } from "@/app/components/types and interfaces/ProjectsAndPortfolios";
import {
  GetAllData,
  PostAllData,
} from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { getColorShade } from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import { MessageSquare, Users } from "lucide-react";
import React, { useEffect, useState } from "react";

const ProjectEngagement = ({
  projectId,
  associations,
  comments,
  likes,
}: {
  projectId: string;
  associations: number;
  comments: number;
  likes: number;
}) => {
  const { accessToken, isOnline, setLoading, userData, isLoading } =
    useGlobalState();
  const { theme } = useTheme();

  const [projectEngagement, setProjectEngagement] =
    useState<ProjectEngagementData>({
      statistics: {
        project_id: projectId,
        likes_count: likes,
        comments_count: comments,
        top_level_comments_count: 0,
        total_engagement: 0,
      },
      recent_likes: [],
      recent_comments: [],
      user_has_liked: false,
      user_has_liked_count: 0,
      total_comments: 0,
    });

  const fetchProjectEngagement = async () => {
    setLoading("fetching_project_engagement");
    try {
      const engagementRes: ProjectEngagementData = await GetAllData({
        access: accessToken,
        url: `${V1_BASE_URL}/projects/${projectId}/engagement/full`,
      });
      if (engagementRes) {
        setProjectEngagement(engagementRes);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading("fetching_project_engagement");
    }
  };

  const handleLikeChange = async () => {
    if (isLoading("liking_project")) return;

    setLoading("liking_project");
    try {
      const likeRes: { is_liked: boolean } = await PostAllData({
        access: accessToken,
        url: `projects/${projectId}/like`,
      });

      if (likeRes) {
        // Only update state after successful API call
        setProjectEngagement((prev) => ({
          ...prev,
          user_has_liked: likeRes.is_liked,
          statistics: {
            ...prev.statistics,
            likes_count: likeRes.is_liked
              ? prev.statistics.likes_count + 1
              : Math.max(0, prev.statistics.likes_count - 1),
          },
        }));
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading("liking_project");
    }
  };

  const getLikeText = () => {
    const { recent_likes, statistics } = projectEngagement;

    // No likes yet
    if (statistics.likes_count === 0) {
      return "Be the first to like this project";
    }

    // Has likes but no recent_likes data
    if (recent_likes.length === 0) {
      return `${statistics.likes_count} ${statistics.likes_count === 1 ? "person likes" : "people like"} this project`;
    }

    const firstLiker = recent_likes[0];
    const isYou = firstLiker.username === userData?.username;
    const displayName = isYou ? "You" : firstLiker.username;

    // Calculate others count (excluding the first liker being displayed)
    const othersCount = statistics.likes_count - 1;

    // Only you liked
    if (statistics.likes_count === 1) {
      return isYou
        ? "You like this project"
        : `${displayName} likes this project`;
    }

    // You and one other person
    if (statistics.likes_count === 2) {
      if (isYou) {
        const secondLiker = recent_likes[1]?.username || "another person";
        return `You and ${secondLiker} like this`;
      }
      return `${displayName} and 1 other like this`;
    }

    // You and multiple others
    if (isYou && statistics.likes_count > 2) {
      return `You and ${othersCount} ${othersCount === 1 ? "other" : "others"} like this`;
    }

    // Someone else and multiple others
    return `${displayName} and ${othersCount} ${othersCount === 1 ? "other" : "others"} like this`;
  };

  useEffect(() => {
    if (isOnline && accessToken) {
      fetchProjectEngagement();
    }
  }, [isOnline, accessToken, projectId]);

  return (
    <div className="my-2">
      <p className="text-xs md:text-sm opacity-50 ">{getLikeText()}</p>
      <div className="grid grid-cols-3 gap-x-2">
        <div
          className="py-1 rounded-lg w-full flex justify-center "
          style={{
            backgroundColor: getColorShade(theme.background, 10),
          }}
        >
          <span className="flex mx-auto items-center gap-x-1">
            <LikeCheckbox
              liked={projectEngagement.user_has_liked}
              onLikeChange={handleLikeChange}
              disabled={isLoading("liking_project")}
            />
            <p className="text-sm font-medium">
              {projectEngagement.statistics.likes_count}
            </p>
          </span>
        </div>
        <div
          className="py-1 rounded-lg w-full items-center flex justify-center"
          style={{
            backgroundColor: getColorShade(theme.background, 10),
          }}
          title="Comments"
        >
          <span className="flex mx-auto items-center gap-x-1">
            <MessageSquare className={` cursor-pointer `} />
            <p className="text-sm font-medium">
              {projectEngagement.statistics.comments_count}
            </p>
          </span>
        </div>
        <div
          className="py-1 rounded-lg w-full items-center flex justify-center "
          style={{
            backgroundColor: getColorShade(theme.background, 10),
          }}
          title="Contributors"
        >
          <span className="flex mx-auto items-center gap-x-1">
            <Users className={` cursor-pointer`} />
            <p className="text-sm font-medium">{associations}</p>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectEngagement;

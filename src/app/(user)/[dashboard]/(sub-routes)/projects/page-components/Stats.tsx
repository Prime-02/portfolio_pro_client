"use client";
import { toast } from "@/app/components/toastify/Toastify";
import { GetAllData } from "@/app/components/utilities/asyncFunctions/lib/crud";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import { useGlobalState } from "@/app/globalStateProvider";
import {
  ProjectStatisticsState,
  useLoadProjectStats,
  useProjectStatisticsStore,
} from "@/app/stores/project_stores/ProjectStats";
import { LucideIcon } from "lucide-react";
import React, { useEffect } from "react";
import {
  FolderOpen,
  Lock,
  Globe,
  CheckCircle,
  Zap,
  Lightbulb,
  Link,
} from "lucide-react";
import BasicSkeleton from "@/app/components/containers/skeletons/BasicSkeleton";

const Stats = () => {
  const { accessToken, loading } = useGlobalState();
  const { ...stats } = useProjectStatisticsStore();

  const loadProjectStats = useLoadProjectStats();

  useEffect(() => {
    loadProjectStats();
  }, [accessToken]);

  const StatsCard = ({
    title,
    value,
    description,
    Icon,
    iconStyle,
  }: {
    title: string;
    value: number;
    description: string;
    Icon: LucideIcon;
    iconStyle: string;
  }) => {
    return (
      <div className="rounded-lg p-4 flex flex-col gap-3 border border-[var(--accent)]/20 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <p className="opacity-65 text-sm font-medium">{title}</p>
          <Icon size={24} className={iconStyle} />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl md:text-4xl font-semibold">{value}</h1>
          <p className="text-xs opacity-60 leading-relaxed">{description}</p>
        </div>
      </div>
    );
  };

  if (loading.includes("loading_project")) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <BasicSkeleton key={item} className="rounded-lg p-4 h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="hidden sm:block ">
      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          title="Total Projects"
          value={stats.total_projects}
          description="All projects in all platforms, including private projects"
          Icon={FolderOpen}
          iconStyle="text-blue-500"
        />
        <StatsCard
          title="Public Projects"
          value={stats.public_projects}
          description="Projects visible to everyone and featured in your public portfolios"
          Icon={Globe}
          iconStyle="text-green-500"
        />
        <StatsCard
          title="Private Projects"
          value={stats.private_projects}
          description="Projects kept private and only visible to you for personal reference"
          Icon={Lock}
          iconStyle="text-red-500"
        />
        <StatsCard
          title="Completed Projects"
          value={stats.completed_projects}
          description="Finished projects that have been successfully delivered or deployed"
          Icon={CheckCircle}
          iconStyle="text-purple-500"
        />
        <StatsCard
          title="Active Projects"
          value={stats.active_projects}
          description="Projects currently in development or actively being worked on"
          Icon={Zap}
          iconStyle="text-yellow-500"
        />
        <StatsCard
          title="Concept Projects"
          value={stats.concept_projects}
          description="Early-stage ideas and prototypes that are still in planning phase"
          Icon={Lightbulb}
          iconStyle="text-orange-500"
        />
      </div>{" "}
    </div>
  );
};

export default Stats;

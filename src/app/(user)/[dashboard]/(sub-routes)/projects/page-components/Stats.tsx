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
import { Icon } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  FolderOpen,
  Lock,
  Globe,
  CheckCircle,
  Zap,
  Lightbulb,
  Link,
  MoreHorizontal,
  Grid3X3,
  PieChart,
  BarChart3,
  TrendingUp,
} from "lucide-react";
import BasicSkeleton from "@/app/components/containers/skeletons/BasicSkeleton";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  PieLabel,
} from "recharts";
import { PathUtil } from "@/app/components/utilities/syncFunctions/syncs";
import Button from "@/app/components/buttons/Buttons";
import Popover from "@/app/components/containers/divs/PopOver";

type ViewType = "cards" | "pie" | "bar" | "line";

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  icon: typeof FolderOpen;
  [key: string]: unknown;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: ChartDataItem;
  }>;
  label?: string;
}

const Stats = () => {
  const { accessToken, loading, checkParams, currentPathWithQuery, router } =
    useGlobalState();
  const { ...stats } = useProjectStatisticsStore();
  const currentView: ViewType =
    (checkParams("statsYiew") as ViewType) || "cards";
  const [showPopover, setShowPopover] = useState(false);

  const setCurrentView = (view: string) => {
    const constructedRoute = PathUtil.addQueryParams(
      currentPathWithQuery,
      {
        statsYiew: view,
      },
      true
    );
    router.push(constructedRoute);
  };

  const loadProjectStats = useLoadProjectStats();

  useEffect(() => {
    loadProjectStats();
  }, [accessToken]);

  // Data for charts
  const chartData: ChartDataItem[] = [
    {
      name: "Total Projects",
      value: stats.total_projects,
      color: "#3b82f6",
      icon: FolderOpen,
    },
    {
      name: "Public Projects",
      value: stats.public_projects,
      color: "#10b981",
      icon: Globe,
    },
    {
      name: "Private Projects",
      value: stats.private_projects,
      color: "#ef4444",
      icon: Lock,
    },
    {
      name: "Completed Projects",
      value: stats.completed_projects,
      color: "#8b5cf6",
      icon: CheckCircle,
    },
    {
      name: "Active Projects",
      value: stats.active_projects,
      color: "#eab308",
      icon: Zap,
    },
    {
      name: "Concept Projects",
      value: stats.concept_projects,
      color: "#f97316",
      icon: Lightbulb,
    },
  ];

  const viewOptions = [
    { type: "cards" as ViewType, label: "Cards View", icon: Grid3X3 },
    { type: "pie" as ViewType, label: "Pie Chart", icon: PieChart },
    { type: "bar" as ViewType, label: "Bar Chart", icon: BarChart3 },
    { type: "line" as ViewType, label: "Line Graph", icon: TrendingUp },
  ];

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
    Icon: typeof FolderOpen;
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

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[var(--background)] p-3 rounded-lg shadow-lg border">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-gray-600">
            Value: <span className="font-semibold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const renderPieChart = () => (
    <div className="w-full h-[80dvh]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            label={({ name, percent }) =>
              `${name}: ${((percent as number) * 100).toFixed(0)}%`
            }
            outerRadius={120}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );

  const renderBarChart = () => (
    <div className="w-full h-[80dvh]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
          />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderLineChart = () => (
    <div className="w-full h-[80dvh]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
          />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ fill: "#3b82f6", strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const renderCardsView = () => (
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
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case "pie":
        return renderPieChart();
      case "bar":
        return renderBarChart();
      case "line":
        return renderLineChart();
      default:
        return renderCardsView();
    }
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
    <div className="hidden sm:block">
      {/* Header with View Selector */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Project Statistics</h2>
        <Popover
          className="relative"
          clickerClassName=""
          clickerContainerClassName=""
          clicker={
            <Button
              onClick={() => setShowPopover(!showPopover)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--accent)]/20 hover:bg-gray-50 transition-colors"
              icon={<MoreHorizontal size={20} />}
              text="View Options"
              size="sm"
              variant="outline"
            />
          }
          position="bottom-left"
        >
          <div className="w-44 flex flex-col items-center  mt-2  rounded-lg shadow-lg py-2 z-10">
            {viewOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.type}
                  onClick={() => {
                    setCurrentView(option.type);
                    setShowPopover(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-colors ${
                    currentView === option.type
                      ? " text-[var(--accent)] bg-[var(--foreground)]/20 "
                      : ""
                  }`}
                >
                  <IconComponent size={18} />
                  <span className="text-sm">{option.label}</span>
                </button>
              );
            })}
          </div>
        </Popover>
      </div>

      {/* Current View */}
      <div className="transition-all duration-300">{renderCurrentView()}</div>

      {/* Click outside to close popover */}
      {showPopover && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowPopover(false)}
        />
      )}
    </div>
  );
};

export default Stats;

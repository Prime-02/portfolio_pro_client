import React, { useState, useEffect } from "react";
import {
  Calendar,
  GitBranch,
  Star,
  GitCommit,
  User,
  ExternalLink,
  Loader2,
  Settings,
  Palette,
  Grid3X3,
} from "lucide-react";

interface ContributionDay {
  date: string;
  contributionCount: number;
  level: number;
}

interface GitHubCalendarProps {
  username: string;
}

const GitHubCalendar: React.FC<GitHubCalendarProps> = ({ username }) => {
  const [contributionData, setContributionData] = useState<
    ContributionDay[] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<ContributionDay | null>(null);
  const [totalContributions, setTotalContributions] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  // All configurable props as state
  const [year, setYear] = useState(new Date().getFullYear());
  const [showStats, setShowStats] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [blockSize, setBlockSize] = useState(12);
  const [showTooltip, setShowTooltip] = useState(true);
  const [showWeekdays, setShowWeekdays] = useState(true);
  const [showMonths, setShowMonths] = useState(true);
  const [colorScheme, setColorScheme] = useState<
    "green" | "blue" | "purple" | "red"
  >("green");

  type ColorLevels = {
    [key: number]: string;
    0: string;
    1: string;
    2: string;
    3: string;
    4: string;
  };

  const colorSchemes: Record<string, ColorLevels> = {
    green: {
      0: "#ebedf0",
      1: "#9be9a8",
      2: "#40c463",
      3: "#30a14e",
      4: "#216e39",
    },
    blue: {
      0: "#ebedf0",
      1: "#79c0ff",
      2: "#58a6ff",
      3: "#388bfd",
      4: "#1f6feb",
    },
    purple: {
      0: "#ebedf0",
      1: "#c9b3ff",
      2: "#b19cd9",
      3: "#9a86c4",
      4: "#8270af",
    },
    red: {
      0: "#ebedf0",
      1: "#ff7b72",
      2: "#ff5252",
      3: "#e53935",
      4: "#c62828",
    },
  };

  const currentColorScheme = colorSchemes[colorScheme];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  useEffect(() => {
    const generateMockData = () => {
      setIsLoading(true);
      setTimeout(() => {
        const data: ContributionDay[] = [];
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);
        let total = 0;

        for (
          let d = new Date(startDate);
          d <= endDate;
          d.setDate(d.getDate() + 1)
        ) {
          const contributions = Math.floor(Math.random() * 15);
          total += contributions;
          data.push({
            date: new Date(d).toISOString().split("T")[0],
            contributionCount: contributions,
            level:
              contributions === 0
                ? 0
                : Math.min(Math.ceil(contributions / 4), 4),
          });
        }

        setContributionData(data);
        setTotalContributions(total);
        setIsLoading(false);
      }, 1000);
    };

    generateMockData();
  }, [username, year]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  const getContributionText = (count: number) =>
    count === 0
      ? "No contributions"
      : `${count} contribution${count === 1 ? "" : "s"}`;

  const calculateStreaks = () => {
    if (!contributionData) return { current: 0, longest: 0 };
    const today = new Date();
    let current = 0,
      longest = 0,
      tempStreak = 0;

    [...contributionData].reverse().forEach((day) => {
      if (new Date(day.date) <= today && day.contributionCount > 0) current++;
      else if (current === 0) return;
      else current = 0;
    });

    contributionData.forEach((day) => {
      if (day.contributionCount > 0) {
        tempStreak++;
        longest = Math.max(longest, tempStreak);
      } else tempStreak = 0;
    });

    return { current, longest };
  };

  const renderCalendar = () => {
    if (!contributionData) return null;
    const weeks: (ContributionDay | null)[][] = [];
    const firstDayOfYear = new Date(year, 0, 1);
    let currentWeek: (ContributionDay | null)[] = Array(
      firstDayOfYear.getDay()
    ).fill(null);

    contributionData.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === contributionData.length - 1) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });

    return (
      <div className="flex flex-col">
        {showMonths && (
          <div className="flex mb-2">
            <div className="w-8"></div>
            <div className="flex-1 flex justify-between text-xs text-gray-600">
              {months.map((month) => (
                <span key={month}>{month}</span>
              ))}
            </div>
          </div>
        )}

        <div className="flex">
          {showWeekdays && (
            <div className="flex flex-col mr-2">
              {weekdays.map((day, index) => (
                <div
                  key={day}
                  className="text-xs text-gray-600 flex items-center justify-end"
                  style={{ height: blockSize + 2, fontSize: 10 }}
                >
                  {index % 2 === 1 && day}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-px">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-px">
                {week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`relative ${day ? "cursor-pointer hover:ring-2 hover:ring-gray-400" : ""}`}
                    style={{
                      width: blockSize,
                      height: blockSize,
                      backgroundColor: day
                        ? currentColorScheme[day.level]
                        : "transparent",
                      borderRadius: 2,
                    }}
                    onClick={() => day && console.log("Day clicked:", day)}
                    onMouseEnter={() => day && setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    {showTooltip && hoveredDay === day && day && (
                      <div className="absolute z-10 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap transform -translate-x-1/2 -translate-y-full top-0 left-1/2 mt-1">
                        <div className="font-semibold">
                          {getContributionText(day.contributionCount)}
                        </div>
                        <div className="text-gray-300">
                          {formatDate(day.date)}
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderStats = () => {
    if (!showStats || !contributionData) return null;
    const streaks = calculateStreaks();
    const stats = [
      { icon: GitCommit, label: "Total", value: totalContributions },
      {
        icon: Star,
        label: "Daily Average",
        value: (totalContributions / contributionData.length).toFixed(1),
      },
      { icon: GitBranch, label: "Current Streak", value: streaks.current },
      { icon: Calendar, label: "Longest Streak", value: streaks.longest },
    ];

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Icon size={16} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-600">{label}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderSettings = () => {
    if (!showSettings) return null;

    return (
      <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Calendar size={14} className="inline mr-1" />
              Year
            </label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full p-2 border rounded text-sm"
              min="2008"
              max={new Date().getFullYear()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Palette size={14} className="inline mr-1" />
              Color Scheme
            </label>
            <select
              value={colorScheme}
              onChange={(e) =>
                setColorScheme(
                  e.target.value as "green" | "blue" | "purple" | "red"
                )
              }
              className="w-full p-2 border rounded text-sm"
            >
              {Object.keys(colorSchemes).map((scheme) => (
                <option key={scheme} value={scheme}>
                  {scheme.charAt(0).toUpperCase() + scheme.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Grid3X3 size={14} className="inline mr-1" />
              Block Size
            </label>
            <input
              type="range"
              min="8"
              max="20"
              value={blockSize}
              onChange={(e) => setBlockSize(Number(e.target.value))}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{blockSize}px</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          {[
            {
              key: "showStats",
              label: "Show Stats",
              value: showStats,
              setter: setShowStats,
            },
            {
              key: "showLegend",
              label: "Show Legend",
              value: showLegend,
              setter: setShowLegend,
            },
            {
              key: "showTooltip",
              label: "Show Tooltip",
              value: showTooltip,
              setter: setShowTooltip,
            },
            {
              key: "showWeekdays",
              label: "Show Weekdays",
              value: showWeekdays,
              setter: setShowWeekdays,
            },
            {
              key: "showMonths",
              label: "Show Months",
              value: showMonths,
              setter: setShowMonths,
            },
          ].map(({ key, label, value, setter }) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setter(e.target.checked)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>
    );
  };

  const renderLegend = () => {
    if (!showLegend) return null;
    return (
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Less</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className="rounded-sm"
                style={{
                  width: blockSize - 2,
                  height: blockSize - 2,
                  backgroundColor: currentColorScheme[level],
                }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
        >
          <User size={14} />
          View on GitHub
          <ExternalLink size={12} />
        </a>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg border">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin mr-2" size={24} />
          <span className="text-gray-600">Loading GitHub contributions...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            {`${username}'s GitHub Contributions (${year})`}
          </h2>
          <p className="text-sm text-gray-600">
            {totalContributions} contributions in {year}
          </p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
        >
          <Settings size={16} />
          Settings
        </button>
      </div>

      {renderSettings()}
      {renderStats()}

      <div className="overflow-x-auto">{renderCalendar()}</div>

      {renderLegend()}
    </div>
  );
};

const App: React.FC = () => {
  const [username, setUsername] = useState("grubersjoe");

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            GitHub Calendar Component
          </h1>
          <p className="text-gray-600 mb-4">
            A comprehensive GitHub contribution calendar - just pass in a
            username!
          </p>

          <div className="flex items-center gap-4 mb-6">
            <label className="text-sm font-medium text-gray-700">
              Username:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
              placeholder="Enter GitHub username"
            />
          </div>
        </div>

        <GitHubCalendar username={username} />
      </div>
    </div>
  );
};

export default App;

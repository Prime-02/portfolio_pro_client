import React from "react";
import {
  User,
  Eye,
  Heart,
  Share2,
  Tag,
  ExternalLink,
  MapPin,
  Calendar,
} from "lucide-react";
import { getColorShade } from "../../utilities/syncFunctions/syncs";
import { useTheme } from "../../theme/ThemeContext ";
import Button from "../../buttons/Buttons";
import Image from "next/image";

interface Profile {
  profile_picture?: string;
  profession?: string;
  location?: string;
  years_of_experience?: number;
  open_to_work?: boolean;
  availability?: string;
}

interface Owner {
  username?: string;
  profile?: Profile;
}

interface Portfolio {
  id?: string;
  name?: string;
  description?: string;
  cover_image_url?: string;
  cover_image_thumbnail?: string;
  is_public?: boolean;
  is_default?: boolean;
  created_at?: string;
  project_count?: number;
  owner?: Owner;
}

interface PortfolioCardProps {
  portfolio: Portfolio;
  isListView?: boolean;
  onView?: (portfolio: Portfolio) => void;
  onLike?: (portfolio: Portfolio) => void;
  onShare?: (portfolio: Portfolio) => void;
  onPortfolioClick?: (portfolio: Portfolio) => void;
}

const PortfolioCard: React.FC<PortfolioCardProps> = ({
  portfolio,
  isListView = false,
  onView,
  onLike,
  onShare,
  onPortfolioClick,
}) => {
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleCardClick = (): void => {
    if (onPortfolioClick) {
      onPortfolioClick(portfolio);
    }
  };

  const handleActionClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    action?: (portfolio: Portfolio) => void
  ): void => {
    e.stopPropagation();
    if (action) action(portfolio);
  };

  const { theme, accentColor } = useTheme();

  if (isListView) {
    return (
      <div
        style={{
          backgroundColor: getColorShade(theme.background, 8),
          borderColor: getColorShade(accentColor.color, 20),
        }}
        className="flex flex-row h-28 rounded-2xl border hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
        onClick={handleCardClick}
      >
        {/* List View Image */}
        <div className="w-32 h-full flex-shrink-0 relative overflow-hidden">
          <Image
          width={1000}
          height={1000}
          priority
            src={
              portfolio.cover_image_url ||
              portfolio.cover_image_thumbnail ||
              "/api/placeholder/400/300"
            }
            alt={portfolio.name || "Portfolio"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />

          {/* Badge */}
          {(portfolio.is_public || portfolio.is_default) && (
            <div className="absolute top-2 left-2">
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  portfolio.is_default
                    ? "bg-purple-100 text-purple-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {portfolio.is_default ? "Default" : "Public"}
              </span>
            </div>
          )}
        </div>

        {/* List View Content */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
              {portfolio.name || "Untitled Portfolio"}
            </h3>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                {portfolio.owner?.profile?.profile_picture ? (
                  <Image
                  width={100}
                  height={100}
                    src={portfolio.owner.profile.profile_picture}
                    alt={portfolio.owner.username || "User"}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User size={10} className="text-white" />
                )}
              </div>
              <span className="text-xs text-gray-600 truncate">
                {portfolio.owner?.username || "Anonymous"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Tag size={12} />
                {portfolio.project_count || 0}
              </span>
              {portfolio.owner?.profile?.open_to_work && (
                <span className="flex items-center gap-1 text-green-600">
                  <div className="w-1.5 h-1.5 bg-green-600 rounded-full"></div>
                  Available
                </span>
              )}
            </div>
            <span className="text-xs text-gray-400">
              {formatDate(portfolio.created_at)}
            </span>
          </div>
        </div>

        {/* List View Actions */}
        <div className="flex flex-col justify-center p-2 gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            className="p-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            onClick={(e) => handleActionClick(e, onView)}
            title="View details"
          >
            <Eye size={14} className="text-gray-600" />
          </button>
          <button
            className="p-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            onClick={(e) => handleActionClick(e, onLike)}
            title="Like portfolio"
          >
            <Heart size={14} className="text-gray-600" />
          </button>
          <button
            className="p-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            onClick={(e) => handleActionClick(e, onShare)}
            title="Share portfolio"
          >
            <Share2 size={14} className="text-gray-600" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: getColorShade(theme.background, 8),
        borderColor: getColorShade(accentColor.color, 20),
      }}
      className="flex flex-col rounded-2xl border hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer max-w-sm"
      onClick={handleCardClick}
    >
      {/* Portfolio Image Container */}
      <div className="relative overflow-hidden h-48">
        <Image
        width={100}
        height={100}
          src={
            portfolio.cover_image_url ||
            portfolio.cover_image_thumbnail ||
            "/api/placeholder/400/300"
          }
          alt={portfolio.name || "Portfolio"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Floating Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <button
            className="p-2.5 bg-white/95 backdrop-blur-sm rounded-xl hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg"
            onClick={(e) => handleActionClick(e, onView)}
            title="View details"
          >
            <Eye size={16} className="text-gray-700" />
          </button>
          <button
            className="p-2.5 bg-white/95 backdrop-blur-sm rounded-xl hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg"
            onClick={(e) => handleActionClick(e, onLike)}
            title="Like portfolio"
          >
            <Heart size={16} className="text-gray-700" />
          </button>
          <button
            className="p-2.5 bg-white/95 backdrop-blur-sm rounded-xl hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg"
            onClick={(e) => handleActionClick(e, onShare)}
            title="Share portfolio"
          >
            <Share2 size={16} className="text-gray-700" />
          </button>
        </div>

        {/* Status Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {portfolio.is_default && (
            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full backdrop-blur-sm">
              Default
            </span>
          )}
          {portfolio.is_public && !portfolio.is_default && (
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full backdrop-blur-sm">
              Public
            </span>
          )}
          {portfolio.owner?.profile?.open_to_work && (
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full backdrop-blur-sm flex items-center gap-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              Available
            </span>
          )}
        </div>
      </div>

      {/* Portfolio Content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 leading-tight">
            {portfolio.name || "Untitled Portfolio"}
          </h3>

          <p className="text-gray-600 text-sm mb-3 line-clamp-2 leading-relaxed">
            {portfolio.description || "No description available"}
          </p>
        </div>

        {/* Author Section */}
        <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            {portfolio.owner?.profile?.profile_picture ? (
              <Image
              width={100}
              height={100}
                src={portfolio.owner.profile.profile_picture}
                alt={portfolio.owner.username || "User"}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User size={18} className="text-white" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {portfolio.owner?.username || "Anonymous"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {portfolio.owner?.profile?.profession || "Developer"}
            </p>

            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              {portfolio.owner?.profile?.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={10} />
                  {portfolio.owner.profile.location}
                </span>
              )}
              {portfolio.owner?.profile?.years_of_experience && (
                <span>{portfolio.owner.profile.years_of_experience}y exp</span>
              )}
            </div>
          </div>
        </div>

        {/* Stats and Meta */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Tag size={14} />
              {portfolio.project_count || 0} projects
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatDate(portfolio.created_at)}
            </span>
          </div>

          {portfolio.owner?.profile?.availability && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {portfolio.owner.profile.availability}
            </span>
          )}
        </div>

        {/* Action Button */}
        <Button
          className="w-full "
          onClick={(e) => handleActionClick(e, onPortfolioClick)}
          icon={<ExternalLink/>}
          text="View Portfollio"
       />
      </div>
    </div>
  );
};

export default PortfolioCard;

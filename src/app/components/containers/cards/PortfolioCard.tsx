import React from "react";
import { User, Eye, Heart, Share2, Tag, ExternalLink } from "lucide-react";
import { getColorShade } from "../../utilities/syncFunctions/syncs";
import { useTheme } from "../../theme/ThemeContext ";

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

  const { theme } = useTheme();

  return (
    <div
      style={{
        backgroundColor: getColorShade(theme.background, 8),
      }}
      className={` rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer ${
        isListView ? "flex flex-row h-32" : "flex flex-col"
      }`}
      onClick={handleCardClick}
    >
      {/* Portfolio Image */}
      <div
        className={`relative overflow-hidden ${
          isListView ? "w-48 flex-shrink-0" : "aspect-video"
        }`}
      >
        <img
          src={
            portfolio.cover_image_url ||
            portfolio.cover_image_thumbnail ||
            "/api/placeholder/400/300"
          }
          alt={portfolio.name || "Portfolio"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Overlay Actions */}
        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
            onClick={(e) => handleActionClick(e, onView)}
            title="View details"
          >
            <Eye size={16} className="text-gray-700" />
          </button>
          <button
            className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
            onClick={(e) => handleActionClick(e, onLike)}
            title="Like portfolio"
          >
            <Heart size={16} className="text-gray-700" />
          </button>
          <button
            className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
            onClick={(e) => handleActionClick(e, onShare)}
            title="Share portfolio"
          >
            <Share2 size={16} className="text-gray-700" />
          </button>
        </div>

        {/* Public Badge */}
        {portfolio.is_public && (
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 bg-green-600 text-white text-xs font-medium rounded-full">
              Public
            </span>
          </div>
        )}

        {/* Default Badge */}
        {portfolio.is_default && (
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 bg-purple-600 text-white text-xs font-medium rounded-full">
              Default
            </span>
          </div>
        )}
      </div>

      {/* Portfolio Info */}
      <div
        className={`p-4 flex-1 ${isListView ? "flex flex-col justify-between" : ""}`}
      >
        <div>
          <h3
            className={`font-semibold text-gray-900 mb-2 line-clamp-2 ${
              isListView ? "text-base" : "text-lg"
            }`}
          >
            {portfolio.name || "Untitled Portfolio"}
          </h3>

          {!isListView && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {portfolio.description || "No description available"}
            </p>
          )}

          {/* Author Info */}
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              {portfolio.owner?.profile?.profile_picture ? (
                <img
                  src={portfolio.owner.profile.profile_picture}
                  alt={portfolio.owner.username || "User"}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User size={16} className="text-white" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {portfolio.owner?.username || "Anonymous"}
              </p>
              <p className="text-xs text-gray-500">
                {portfolio.owner?.profile?.profession || "Developer"}
              </p>
              <p className="text-xs text-gray-500">
                {formatDate(portfolio.created_at)}
              </p>
            </div>
          </div>

          {/* Location & Experience */}
          {portfolio.owner?.profile && (
            <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
              {portfolio.owner.profile.location && (
                <span className="flex items-center gap-1">
                  📍 {portfolio.owner.profile.location}
                </span>
              )}
              {portfolio.owner.profile.years_of_experience && (
                <span>
                  {portfolio.owner.profile.years_of_experience} years exp
                </span>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Tag size={14} />
              {portfolio.project_count || 0} projects
            </span>
            {portfolio.owner?.profile?.open_to_work && (
              <span className="flex items-center gap-1 text-green-600">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                Open to work
              </span>
            )}
          </div>

          {portfolio.owner?.profile?.availability && (
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              {portfolio.owner.profile.availability}
            </span>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <button
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={(e) => handleActionClick(e, onPortfolioClick)}
          >
            <span className="text-sm font-medium">View Portfolio</span>
            <ExternalLink size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioCard;

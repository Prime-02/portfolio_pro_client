"use client";
import React from "react";
import InfiniteScrollDiv from "@/app/components/containers/divs/infinitescroll/InfiniteScrollDiv ";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import PageHeader from "@/app/components/containers/divs/header/PageHeader";
import PortfolioGrid from "@/app/components/containers/cards/PortfolioGrid";
import { getColorShade } from "@/app/components/utilities/syncFunctions/syncs";
import { useTheme } from "@/app/components/theme/ThemeContext ";

const PortfolioPage = () => {
  const [viewMode, setViewMode] = React.useState("grid");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filterTag, setFilterTag] = React.useState("");
  const { theme } = useTheme();

  const handlePortfolioClick = (portfolio = {}) => {
    console.log("Portfolio clicked:", portfolio);
    // Handle navigation to portfolio detail
  };

  const handlePortfolioView = (portfolio = {}) => {
    console.log("Portfolio viewed:", portfolio);
    // Handle view action
  };

  const handlePortfolioLike = (portfolio = {}) => {
    console.log("Portfolio liked:", portfolio);
    // Handle like action
  };

  const handlePortfolioShare = (portfolio = {}) => {
    console.log("Portfolio shared:", portfolio);
    // Handle share action
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFilterTag("");
  };

  return (
    <div
      className={`min-h-screen  pt-32`}
      style={{
        backgroundColor: getColorShade(theme.background, 8),
      }}
    >
      {/* Header */}
      <PageHeader
        title="Public Portfolios"
        subtitle="Discover amazing portfolios from our community"
      ></PageHeader>

      {/* Main Content */}
      <div className="max-w-7xl h-auto  mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <InfiniteScrollDiv
          baseUrl={`${V1_BASE_URL}/portfolios/public`}
          skipParam="skip"
          limitParam="limit"
          initialLimit={10}
        >
          {({ data, loading, error, hasMore, refetch }) => (
            <PortfolioGrid
              data={data}
              loading={loading}
              error={error}
              hasMore={hasMore}
              onRefetch={refetch}
              viewMode={viewMode}
              onPortfolioClick={handlePortfolioClick}
              onPortfolioView={handlePortfolioView}
              onPortfolioLike={handlePortfolioLike}
              onPortfolioShare={handlePortfolioShare}
              searchTerm={searchTerm}
              filterTag={filterTag}
              onClearFilters={handleClearFilters}
            />
          )}
        </InfiniteScrollDiv>
      </div>
    </div>
  );
};

export default PortfolioPage;

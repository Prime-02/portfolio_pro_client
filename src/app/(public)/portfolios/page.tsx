"use client";
import React, { useState } from "react";
import InfiniteScrollDiv from "@/app/components/containers/divs/infinitescroll/InfiniteScrollDiv ";
import { V1_BASE_URL } from "@/app/components/utilities/indices/urls";
import PortfolioGrid from "@/app/components/containers/cards/PortfolioGrid";
import { useTheme } from "@/app/components/theme/ThemeContext ";

const PortfolioPage = () => {
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTag, setFilterTag] = useState("");
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
      className={`min-h-screen border border-[var(--accent)] rounded-2xl pt-32`}
    >

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
              setViewMode={setViewMode}
            />
          )}
        </InfiniteScrollDiv>
      </div>
    </div>
  );
};

export default PortfolioPage;

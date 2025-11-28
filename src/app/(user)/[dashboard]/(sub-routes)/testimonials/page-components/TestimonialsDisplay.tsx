import EmptyState from "@/app/components/containers/cards/EmptyState";
import ErrorDisplay from "@/app/components/containers/cards/ErrorDisplay";
import { getLoader } from "@/app/components/loaders/Loader";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { useGlobalState } from "@/app/globalStateProvider";
import { useTestimonialsStore } from "@/app/stores/testimonials_store/TestimonialsStore";
import React, { useEffect, useState } from "react";
import TestimonialsCard from "./TestimonialsCard";
import {
  copyToClipboard,
  getCurrentUrl,
} from "@/app/components/utilities/syncFunctions/syncs";

const TestimonialsDisplay = () => {
  const {
    accessToken,
    setLoading,
    currentUser,
    isOnline,
    isLoading,
    userData,
    checkParams,
    currentPathWithQuery,
    extendRouteWithQuery,
  } = useGlobalState();
  const {
    fetchTestimonials,
    testimonials,
    error: testimonialsError,
    testimonialSummary,
    myAuthoredTestimonials,
    fetchMyAuthoredTestimonials,
    fetchTestimonialSummary,
    searchTestimonials,
  } = useTestimonialsStore();
  const { accentColor, loader } = useTheme();
  const [filter, setFilter] = useState(checkParams("filter") || "summary");
  const searchQuery = checkParams("q") || "";
  const LoaderComponent = getLoader(loader) || null;

  useEffect(() => {
    setFilter(checkParams("filter") || "summary");
  }, [currentPathWithQuery]);

  const testimonialsHandler = () => {
    switch (filter) {
      case "all":
        fetchTestimonials(
          accessToken,
          setLoading,
          currentUser ? currentUser : userData.username
        );
        return;
      case "authored":
        fetchMyAuthoredTestimonials(accessToken, setLoading);
        return;
      case "summary":
        fetchTestimonialSummary(
          accessToken,
          currentUser ? currentUser : userData.username,
          setLoading
        );
        return;
      case "search":
        searchTestimonials(accessToken, searchQuery, setLoading);
        return;
      default:
        fetchTestimonialSummary(
          accessToken,
          currentUser ? currentUser : userData.username,
          setLoading
        );
        return;
    }
  };

  const testimonialData = () => {
    switch (filter) {
      case "all":
        return testimonials;
      case "authored":
        return myAuthoredTestimonials;
      case "summary":
        return testimonialSummary?.recent_testimonials || [];
      default:
        return testimonials;
    }
  };

  useEffect(() => {
    // Early return conditions
    if (!isOnline || !accessToken || !(userData.username || currentUser))
      return;

    // Search-specific validation
    if (filter === "search" && searchQuery.length <= 3) return;

    testimonialsHandler();
  }, [
    isOnline,
    accessToken,
    filter,
    searchQuery,
    currentUser,
    userData.username,
  ]);

  if (
    isLoading("fetching_testimonials") ||
    isLoading("fetching_my_authored") ||
    isLoading("searching_testimonials") ||
    isLoading(
      `fetching_summary_${currentUser ? currentUser : userData.username}`
    )
  ) {
    return (
      <div className="flex justify-center items-center">
        {LoaderComponent && <LoaderComponent color={accentColor.color} />}
      </div>
    );
  }

  if (
    testimonialData()?.length === 0 &&
    !isLoading("fetching_testimonials") &&
    !isLoading("fetching_my_authored") &&
    !isLoading("searching_testimonials") &&
    !isLoading(
      `fetching_summary_${currentUser ? currentUser : userData.username}`
    )
  ) {
    return (
      <div className="flex justify-center items-center">
        <EmptyState
          title={
            filter === "search"
              ? "No testimonial found"
              : "No testimonial for this user"
          }
          description={
            filter === "search"
              ? "We couldn't find any testimonial with the provided search parameters"
              : currentUser
                ? `Your testimonial can make a big difference. Be the first to write one for ${currentUser}.`
                : "Copy link to invite colleagues to write you a testimonial"
          }
          actionText={filter === "search" ? "Refresh" : "Proceed"}
          onAction={() => {
            if (filter === "search") {
              testimonialsHandler();
            } else if (currentUser) {
              extendRouteWithQuery({ create: "true" });
            } else {
              copyToClipboard(
                `${getCurrentUrl("origin")}/${userData.username}/testimonials?create=true`
              );
            }
          }}
        />
      </div>
    );
  }

  if (testimonialsError) {
    return (
      <div className="flex justify-center items-center">
        <ErrorDisplay
          title="Error Loading Testimonials"
          description="There was an error fetching the testimonials. Please try again."
          onRetry={() => {
            testimonialsHandler();
          }}
          error={testimonialsError}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {(testimonialData() || []).map((testimonial, i) => (
        <TestimonialsCard key={i} {...testimonial} />
      ))}
    </div>
  );
};

export default TestimonialsDisplay;

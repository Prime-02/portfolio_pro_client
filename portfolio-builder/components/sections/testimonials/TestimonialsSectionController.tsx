// portfolio-builder/components/sections/testimonials/TestimonialsSectionController.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import TestimonialsRenderer from "./TestimonialsRenderer";
import TestimonialsEditor from "./TestimonialsEditor";
import { TestimonialsData, getEmptyTestimonialsData } from "@/portfolio-builder/types/testimonials";
import { useTestimonialsStore } from "@/lib/stores/testimonials/useTestimonial";

interface TestimonialsSectionControllerProps {
  testimonialsData: TestimonialsData | null;
  onSave: (updatedTestimonialsData: TestimonialsData) => Promise<void>;
  username: string;
  viewOnly: boolean
}

export default function TestimonialsSectionController({
  testimonialsData,
  onSave,
  username,
  viewOnly
}: TestimonialsSectionControllerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const { fetchUserTestimonials } = useTestimonialsStore();

  const [localData, setLocalData] = useState<TestimonialsData | null>(testimonialsData);
  useEffect(() => {
    if (testimonialsData) setLocalData(testimonialsData);
  }, [testimonialsData]);

  const prefetchedRef = useRef(false);
  useEffect(() => {
    if (!username || !testimonialsData || prefetchedRef.current) return;
    prefetchedRef.current = true;
    fetchUserTestimonials({
      username,
      is_featured: testimonialsData.filters?.is_featured,
      author_company: testimonialsData.filters?.author_company,
      author_relationship: testimonialsData.filters?.author_relationship,
      rating: testimonialsData.filters?.min_rating,
      ids: testimonialsData.filters?.ids,
      merge_filters: testimonialsData.filters?.merge_filters,
    });
  }, [username, testimonialsData]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async (updatedTestimonialsData: TestimonialsData) => {
    setLocalData(updatedTestimonialsData);
    await onSave(updatedTestimonialsData);
  };

  const handleCancel = () => {
    setLocalData(testimonialsData);
    setIsEditing(false);
  };

  const handleSetFullscreen = (latestData: TestimonialsData) => {
    setLocalData(latestData);
    setIsEditing(false);
  };

  if (!localData && !isEditing) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-center">
          <p className="text-[var(--pb-text-muted)] text-sm mb-4">Testimonials section not set up</p>
          <button
            onClick={() => setIsEditing(true)}
            className="px-6 py-3 bg-[var(--pb-foreground)] text-[var(--pb-background)] rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
          >
            Add Testimonials Section
          </button>
        </div>
      </div>
    );
  }

  if (isEditing) {
    return (
      <TestimonialsEditor
        initialData={localData || getEmptyTestimonialsData()}
        onSave={handleSave}
        onCancel={handleCancel}
        setFullScreen={handleSetFullscreen}
        username={username}
      />
    );
  }

  return (
    <div className="relative">
      <TestimonialsRenderer data={localData!} username={username} />


      {
        !viewOnly &&
        <button
          onClick={() => setIsEditing(true)}
          className="absolute top-4 right-4 z-50 px-4 py-2 bg-[var(--pb-foreground-10)] backdrop-blur text-[var(--pb-text-primary)] border border-[var(--pb-border)] rounded-lg font-medium text-sm hover:bg-[var(--pb-foreground-20)] transition-colors"
        >
          Edit
        </button>
      }
    </div>
  );
}

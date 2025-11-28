import Button from "@/app/components/buttons/Buttons";
import Popover from "@/app/components/containers/divs/PopOver";
import TextFormatter from "@/app/components/containers/TextFormatters/TextFormatter";
import StarRating from "@/app/components/inputs/StarRating";
import { TestimonialsProps } from "@/app/components/types and interfaces/Testimonials";
import { getImageSrc } from "@/app/components/utilities/syncFunctions/syncs";
import { useGlobalState } from "@/app/globalStateProvider";
import { useTestimonialsStore } from "@/app/stores/testimonials_store/TestimonialsStore";
import { Edit, Trash } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const TestimonialsCard = (testimonial: TestimonialsProps) => {
  const {
    userData,
    extendRouteWithQuery,
    accessToken,
    setLoading,
    isLoading,
    checkParams,
    viewportWidth,
  } = useGlobalState();
  const { setCurrentTestimonial, deleteTestimonial } = useTestimonialsStore();

  return (
    <div
      className={`border ${
        userData.id === testimonial.author.id
          ? "border-[var(--accent)]"
          : "border-[var(--accent)]/20"
      } p-3 sm:p-4 md:p-5 rounded-lg shadow-md flex flex-col hover:shadow-lg transition-shadow relative duration-300 bg-[var(--card-bg)] h-full`}
    >
      {/* Action buttons - better positioned for mobile */}
      {userData.id === testimonial.author.id && (
        <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
          <Button
            variant="ghost"
            icon={<Edit size={16} className="sm:w-4 sm:h-4" />}
            size="sm"
            onClick={() => {
              extendRouteWithQuery({ update: testimonial.id || "" });
              setCurrentTestimonial(testimonial);
            }}
          />
          <Popover
            clicker={
              <Button
                variant="ghost"
                customColor="red"
                icon={<Trash size={16} className="sm:w-4 sm:h-4" />}
                size="sm"
              />
            }
            className=""
            clickerContainerClassName=""
            clickerClassName=""
          >
            <div className="p-4 flex flex-col items-center gap-3">
              <p className="text-sm sm:text-base text-center">
                Are you sure you want to delete this testimonial?
              </p>
              <Button
                text="Delete"
                variant="danger"
                onClick={() => {
                  deleteTestimonial(
                    accessToken,
                    testimonial.id || "",
                    userData.username,
                    setLoading
                  );
                }}
                className="w-full"
                loading={isLoading(`deleting_testimonial_${testimonial.id}`)}
                disabled={isLoading(`deleting_testimonial_${testimonial.id}`)}
              />
              <footer className="text-center text-xs opacity-65 mt-2">
                Click outside to close
              </footer>
            </div>
          </Popover>
        </div>
      )}

      {/* Author info section - improved responsive layout */}
      <div className="flex items-start gap-3 sm:gap-4 mb-4 pr-16 sm:pr-20">
        {/* Avatar - responsive sizing */}
        <div className="relative flex-shrink-0 h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 rounded-full overflow-hidden">
          <Image
            src={getImageSrc(
              testimonial.author.profile_picture,
              testimonial.author_name
            )}
            alt={testimonial.author_name}
            layout="fill"
            objectFit="cover"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Author details - better text wrapping */}
        <div className="flex flex-col justify-center items-start min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap w-full">
            <Link
              href={`/${testimonial.author.username}`}
              className="text-base sm:text-lg md:text-xl font-semibold hover:underline truncate max-w-full"
            >
              {testimonial.author_name}
            </Link>
            {userData.id === testimonial.author.id && (
              <span className="text-xs px-2 py-0.5 bg-[var(--accent)]/20 text-[var(--accent)] rounded-full whitespace-nowrap">
                You
              </span>
            )}
          </div>

          {/* Job title and company - improved wrapping */}
          {(testimonial.author_title || testimonial.author_company) && (
            <div className="text-xs sm:text-sm opacity-65 flex items-center flex-wrap gap-1 w-full">
              {testimonial.author_title && (
                <span className="break-words">{testimonial.author_title}</span>
              )}
              {testimonial.author_company && (
                <span className="break-words">
                  @ {testimonial.author_company}
                </span>
              )}
            </div>
          )}

          {/* Relationship */}
          {testimonial.author_relationship && (
            <span className="text-xs sm:text-sm opacity-65 mt-0.5 break-words w-full">
              {testimonial.author_relationship}
            </span>
          )}
        </div>
      </div>

      {/* Rating - consistent spacing */}
      <div className="mb-3">
        <StarRating
          readonly
          value={testimonial.rating || 0}
          size={viewportWidth < 640 ? 12 : 14}
        />
      </div>

      {/* Content - proper text formatting */}
      <div className="flex-1 text-sm sm:text-base">
        <TextFormatter>{testimonial.content}</TextFormatter>
      </div>
    </div>
  );
};

export default TestimonialsCard;

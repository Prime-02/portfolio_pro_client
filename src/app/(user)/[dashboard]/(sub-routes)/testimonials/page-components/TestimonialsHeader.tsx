import Button from "@/app/components/buttons/Buttons";
import BasicHeader from "@/app/components/containers/divs/header/BasicHeader";
import Popover from "@/app/components/containers/divs/PopOver";
import StarRating from "@/app/components/inputs/StarRating";
import { getLoader } from "@/app/components/loaders/Loader";
import { useTheme } from "@/app/components/theme/ThemeContext ";
import { useGlobalState } from "@/app/globalStateProvider";
import { useTestimonialsStore } from "@/app/stores/testimonials_store/TestimonialsStore";
import { Repeat } from "lucide-react";
import React from "react";

const TestimonialsHeader = () => {
  const { extendRouteWithQuery, currentUser, userData, router, isLoading } =
    useGlobalState();
  const { testimonials, testimonialSummary } = useTestimonialsStore();
  const { accentColor, loader } = useTheme();

  const LoaderComponent = getLoader(loader) || null;

  // Determine when to show the "Say something" button
  const showSaySomethingButton =
    currentUser &&
    (testimonials.length === 0 || testimonials[0]?.author?.id !== userData?.id);

  return (
    <div>
      <header className="p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-4 mb-6">
          {" "}
          <div className="flex items-center gap-x-3">
            <BasicHeader
              heading="Testimonials"
              headingClass="md:text-6xl text-4xl font-bold"
              subHeading={
                currentUser
                  ? `What people are saying about ${currentUser}`
                  : "See what others are saying about you"
              }
              subHeadingClass="md:text-3xl text-xl font-semibold"
            />
            {currentUser && (
              <Popover
                position="center-right"
                clicker={<Button variant="ghost" icon={<Repeat />} />}
              >
                <Button
                  variant="ghost"
                  text="Back to your Testimonials"
                  onClick={() => {
                    router.push(`/${userData.username}/testimonials`);
                  }}
                />
              </Popover>
            )}
          </div>
          <div className="flex flex-col gap-y-2 ">
            {isLoading(
              `fetching_summary_${currentUser ? currentUser : userData?.username}`
            ) ? (
              <div className="flex justify-center items-center w-full md:w-fit h-8">
                {LoaderComponent && (
                  <LoaderComponent color={accentColor.color} small />
                )}
              </div>
            ) : (
              (testimonialSummary?.stats.average_rating || 0) > 0 && (
                <div className="flex justify-between gap-x-3 w-full items-center ">
                  <p className="opacity-65 text-sm">Average Rating:</p>
                  <StarRating
                    readonly
                    value={testimonialSummary?.stats.average_rating || 1}
                    size={14}
                  />
                </div>
              )
            )}
            {showSaySomethingButton && (
              <Button
                text={`Say something about ${currentUser}`}
                variant="primary"
                className="self-end w-full md:w-fit sm:self-auto"
                onClick={() => {
                  extendRouteWithQuery({ create: "true" });
                }}
              />
            )}
          </div>
        </div>
      </header>
    </div>
  );
};

export default TestimonialsHeader;

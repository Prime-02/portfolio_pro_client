import Button from "@/app/components/buttons/Buttons";
import Dropdown from "@/app/components/inputs/DynamicDropdown";
import StarRating from "@/app/components/inputs/StarRating";
import { TextArea } from "@/app/components/inputs/TextArea";
import { Textinput } from "@/app/components/inputs/Textinput";
import { TestimonialCreate } from "@/app/components/types and interfaces/Testimonials";
import { useGlobalState } from "@/app/globalStateProvider";
import { useTestimonialsStore } from "@/app/stores/testimonials_store/TestimonialsStore";
import { useUserProfileStore } from "@/app/stores/user/UserProfile";
import React, { useEffect, useState } from "react";

const TestimonialsAction = () => {
  const {
    userData,
    currentUser,
    accessToken,
    isOnline,
    setLoading,
    checkParams,
    checkValidId,
    clearQuerryParam,
    isLoading,
  } = useGlobalState();
  const { addTestimonial, updateTestimonial, currentTestimonial } =
    useTestimonialsStore();
  const { userProfile, fetchUserProfile } = useUserProfileStore();
  const [testimonialsForm, setTestimonialsForm] = useState<TestimonialCreate>({
    username: String(currentUser),
    author_name: currentTestimonial?.author_name || "",
    content: currentTestimonial?.content || "",
    rating: currentTestimonial?.rating || 1,
    author_title: currentTestimonial?.author_title || userProfile.profession,
    author_company: currentTestimonial?.author_company || "",
    author_relationship: currentTestimonial?.author_relationship || "",
  });
  const updateId = checkParams("update") || "";
  const isUpdate = checkValidId(updateId);

  useEffect(() => {
    if (isOnline && !userProfile.profession) {
      fetchUserProfile(accessToken, currentUser, setLoading);
    }
  }, [userProfile, isOnline]);

  const handleTestimonialsFormChange = (
    key: string,
    value: string | number
  ) => {
    setTestimonialsForm((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };
  const authorNameOptions = [
    { id: userData.username, code: userData.username },
    {
      id:
        userData.firstname && userData.lastname
          ? `${userData.firstname} ${userData.lastname}`
          : userData.email.split("@")[0],
      code:
        userData.firstname && userData.lastname
          ? `${userData.firstname} ${userData.lastname}`
          : userData.email.split("@")[0],
    },
    { id: userData.email, code: userData.email },
  ];

  const authorRelationshipOptions = [
    { id: "Colleague", code: "Colleague" },
    { id: "Manager", code: "Manager" },
    { id: "Client", code: "Client" },
    { id: "Friend", code: "Friend" },
    { id: "Mentor", code: "Mentor" },
    { id: "Mentee", code: "Mentee" },
    { id: "Classmate", code: "Classmate" },
  ];

  return (
    <div className="flex flex-col gap-y-3 w-full">
      {/* 1. Author Name - Critical for attribution */}
      <div>
        <Dropdown
          options={authorNameOptions}
          onSelect={(value) =>
            handleTestimonialsFormChange("author_name", value)
          }
          label="Name, Username, or Email"
          includeNoneOption={false}
          value={testimonialsForm.author_name}
        />
      </div>

      {/* 2. Rating - Core testimonial metric */}
      <div className="flex flex-wrap justify-between items-center gap-2">
        <p className="opacity-65 text-xs">
          How would you rate {currentUser ? currentUser : "this user"}?
        </p>
        <StarRating
          value={testimonialsForm.rating || 1}
          onChange={(value) => handleTestimonialsFormChange("rating", value)}
          size={16}
        />
      </div>

      {/* 3. Content - Main testimonial text */}
      <div>
        <TextArea
          value={testimonialsForm.content}
          onChange={(value) => handleTestimonialsFormChange("content", value)}
          label={`Say what you think about ${currentUser ? currentUser : "this user"}...`}
          showFormatPanel={true}
          showLimit={false}
          maxLength={5000}
        />
      </div>

      {/* 4. Author Title - Adds credibility */}
      <div>
        <Textinput
          id="author_title"
          value={testimonialsForm.author_title}
          onChange={(value) =>
            handleTestimonialsFormChange("author_title", value)
          }
          label={`Your Title/Profession`}
          desc="Ex: Software Engineer, Product Manager, Designer, etc."
        />
      </div>

      {/* 5. Relationship - Provides context */}
      <div>
        <Dropdown
          options={authorRelationshipOptions}
          type="datalist"
          value={testimonialsForm.author_relationship}
          onSelect={(value) =>
            handleTestimonialsFormChange("author_relationship", value)
          }
          label={`Your relationship with ${currentUser ? currentUser : "this user"} (optional)`}
          includeNoneOption={false}
        />
      </div>

      {/* 6. Company - Additional credibility (optional) */}
      <div>
        <Textinput
          id="author_company"
          value={testimonialsForm.author_company}
          onChange={(value) =>
            handleTestimonialsFormChange("author_company", value)
          }
          label={`Company/Organisation (optional)`}
          desc="Organisation or company you are affiliated with."
        />
      </div>
      <Button
        text={isUpdate ? "Update Testimonial" : "Upload Testimonial"}
        variant="primary"
        className="w-full"
        onClick={() => {
          if (isUpdate) {
            updateTestimonial(
              accessToken,
              updateId,
              setLoading,
              testimonialsForm,
              () => {
                clearQuerryParam();
              }
            );
          } else {
            addTestimonial(accessToken, setLoading, testimonialsForm, () => {
              clearQuerryParam();
            });
          }
        }}
        loading={
          isLoading("uploading_testimonial") ||
          isLoading(`updating_testimonial_${updateId}`)
        }
        disabled={
          isLoading("uploading_testimonial") ||
          isLoading(`updating_testimonial_${updateId}`)
        }
      />
    </div>
  );
};

export default TestimonialsAction;

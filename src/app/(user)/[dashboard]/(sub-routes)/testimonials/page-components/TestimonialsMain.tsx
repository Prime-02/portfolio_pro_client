"use client";
import React from "react";
import TestimonialsHeader from "./TestimonialsHeader";
import Modal from "@/app/components/containers/modals/Modal";
import { useGlobalState } from "@/app/globalStateProvider";
import TestimonialsAction from "./TestimonialsAction";
import TestimonialsDisplay from "./TestimonialsDisplay";
import TestimonialsSearchBar from "./TestimonialsSearchBar";

const TestimonialsMain = () => {
  const { checkParams, clearQuerryParam, checkValidId } = useGlobalState();
  const testimonialId = checkValidId(checkParams("update") || "")
    ? checkParams("update")
    : "";
  return (
    <>
      <div className="flex flex-col">
        <TestimonialsHeader />
        <TestimonialsSearchBar />
        <TestimonialsDisplay />
      </div>
      <Modal
        isOpen={
          checkParams("create") === "true" ||
          checkValidId(checkParams("update") || "")
        }
        onClose={() => clearQuerryParam()}
        title={
          checkParams("create") === "true"
            ? "Add new testimonial"
            : checkValidId(testimonialId || "")
              ? "Update this testimonial"
              : ""
        }
        centered
      >
        <TestimonialsAction />
      </Modal>
    </>
  );
};

export default TestimonialsMain;

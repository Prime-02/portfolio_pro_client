import React from "react";

interface BasicHeaderProps {
  heading: string;
  headingClass?: string;
  subHeading?: string;
  subHeadingClass?: string;
  containerClass?: string;
}

const BasicHeader = ({
  heading,
  headingClass,
  subHeading,
  subHeadingClass,
  containerClass,
}: BasicHeaderProps) => {
  return (
    <div className={`flex flex-col items-start ${containerClass} `}>
      <h1 className={`md:text-3xl text-2xl font-semibold ${headingClass} `}>
        {heading}
      </h1>
      <h3
        className={`md:text-base text-sm opacity-65 font-thin ${subHeadingClass} max-w-2xl`}
      >
        {subHeading}
      </h3>
    </div>
  );
};

export default BasicHeader;

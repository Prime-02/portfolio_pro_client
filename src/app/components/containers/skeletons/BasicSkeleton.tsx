import React from "react";

const BasicSkeleton = ({ className }: { className: string }) => (
  <div
    className={`bg-gradient-to-br animated-gradient from-slate-900 via-[var(--accent)] to-slate-900 transform cursor-pointer  ${className}`}
  ></div>
);

export default BasicSkeleton;

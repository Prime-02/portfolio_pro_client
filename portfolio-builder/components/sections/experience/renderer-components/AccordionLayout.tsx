// portfolio-builder/components/sections/experience/renderer-components/AccordionLayout.tsx

import { useState } from "react";
import Image from "@/src/app/components/ui/Image";
import { ChevronDown, Briefcase, MapPin, Calendar, Building2, Star } from "lucide-react";
import { MotionItem } from "../../bio/renderer-components/MotionWrappers";
import type { LayoutProps } from "./layoutProps";

const GAP_CLASS = { small: "gap-1", medium: "gap-2", large: "gap-3" } as const;

function formatDateRange(start?: string | null, end?: string | null, isCurrent?: boolean): string {
  const fmt = (d: string | null | undefined) => {
    if (!d) return "";
    const date = new Date(d);
    return isNaN(date.getTime()) ? d : date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
  };
  return `${fmt(start)} — ${isCurrent ? "Present" : fmt(end)}`;
}

export default function AccordionLayout({
  experiences,
  data,
  isAnimated,
  shouldAnimate,
  anim,
}: LayoutProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const gapClass = GAP_CLASS[data.gap];

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className={`flex flex-col ${gapClass} w-full`}>
      {experiences.map((exp, index) => {
        const isOpen = openIndex === index;
        const dateRange = formatDateRange(exp.start_date, exp.end_date, exp.is_current);

        return (
          <MotionItem
            key={exp.id || index}
            isAnimated={isAnimated}
            shouldAnimate={shouldAnimate}
            anim={anim}
          >
            <div
              className={`rounded-xl border transition-all duration-200 ${isOpen
                ? "border-[var(--pb-foreground-30)] bg-[var(--pb-surface)]"
                : "border-[var(--pb-border)] bg-[var(--pb-surface)] hover:border-[var(--pb-foreground-20)]"
                }`}
            >
              {/* Accordion header */}
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
              >
                {data.showCompanyLogo && exp.company_logo_url && (
                  <Image
                    src={exp.company_logo_url}
                    alt={exp.company_name || "Company logo"}
                    width={36}
                    height={36}
                    className="w-9 h-9 rounded-lg object-contain shrink-0 bg-[var(--pb-background)]"
                  />
                )}

                <div className="flex-1 min-w-0">
                  {data.showJobTitle && (
                    <p className="text-sm font-semibold text-[var(--pb-text-primary)] truncate">
                      {exp.job_title}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[var(--pb-text-muted)]">
                    {data.showCompanyName && (
                      <span className="inline-flex items-center gap-1">
                        <Building2 size={10} />
                        {exp.company_name}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1">
                      <Calendar size={10} />
                      {dateRange}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {exp.is_current && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[var(--pb-success-20)] text-[var(--pb-success)] border border-[var(--pb-success-30)]">
                      <span className="w-1 h-1 rounded-full bg-[var(--pb-success)] animate-pulse" />
                      Current
                    </span>
                  )}
                  {exp.is_featured && (
                    <Star size={14} className="text-[var(--pb-accent)]" fill="currentColor" />
                  )}
                  <ChevronDown
                    size={16}
                    className={`text-[var(--pb-text-muted)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                      }`}
                  />
                </div>
              </button>

              {/* Accordion body */}
              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-[var(--pb-border)] space-y-3">
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {data.showEmploymentType && exp.employment_type && (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-[var(--pb-text-secondary)]">
                        <Briefcase size={10} />
                        {exp.employment_type}
                      </span>
                    )}
                    {data.showLocationType && exp.location_type && (
                      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-[var(--pb-surface-elevated)] border border-[var(--pb-border)] text-[var(--pb-text-secondary)]">
                        <MapPin size={10} />
                        {exp.location_type}
                      </span>
                    )}
                  </div>

                  {data.showDescription && exp.description && (
                    <p className="text-sm text-[var(--pb-text-secondary)] leading-relaxed">
                      {exp.description}
                    </p>
                  )}

                  {data.showSkills && exp.skills && exp.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {exp.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 rounded-lg bg-[var(--pb-foreground-10)] text-[var(--pb-text-secondary)] border border-[var(--pb-border)]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </MotionItem>
        );
      })}
    </div>
  );
}
"use client";

import React, { JSX, useState } from "react";
import Image from "@/src/app/components/ui/Image";
import Link from "next/link";
import {
  Star,
  MapPin,
  Briefcase,
  ChevronDown,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { useRouting } from "@/lib/hooks/routing/useRouting";
import { UserRatingRanking } from "@/lib/stores/testimonials/useTestimonial";

interface ProfessionalRankingCardProps {
  user: UserRatingRanking;
  rank: number;
}

function getRankBadge(rank: number): { label: string; color: string } {
  if (rank === 1) return { label: "#1", color: "text-amber-500 bg-amber-500/10" };
  if (rank === 2) return { label: "#2", color: "text-slate-400 bg-slate-400/10" };
  if (rank === 3) return { label: "#3", color: "text-orange-600 bg-orange-600/10" };
  return { label: `#${rank}`, color: "text-[var(--foreground)]/40 bg-[var(--foreground)]/5" };
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function renderStars(rating: number): JSX.Element {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const stars = [];

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <Star key={i} size={14} fill="currentColor" className="text-amber-400" />
      );
    } else if (i === fullStars && hasHalf) {
      stars.push(
        <span key={i} className="relative inline-block">
          <Star size={14} className="text-[var(--foreground)]/15" />
          <span className="absolute inset-0 overflow-hidden w-1/2">
            <Star size={14} fill="currentColor" className="text-amber-400" />
          </span>
        </span>
      );
    } else {
      stars.push(
        <Star key={i} size={14} className="text-[var(--foreground)]/15" />
      );
    }
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
}

export default function ProfessionalRankingCard({
  user,
  rank,
}: ProfessionalRankingCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { router } = useRouting();
  const badge = getRankBadge(rank);

  const displayName = user.firstname && user.lastname
    ? `${user.firstname} ${user.middlename ? user.middlename + " " : ""}${user.lastname}`
    : user.username || "Not Set";

  const highestTestimonial = user.highest_rated_testimonial;

  return (
    <article
      className="rounded-2xl border border-[var(--foreground)]/10 overflow-hidden transition-all duration-200 hover:shadow-md"
      style={{ backgroundColor: "var(--background)" }}
    >
      {/* Main Card Content — Always Visible */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Link
            href={`/${user.username}`}
            className="flex-shrink-0">
            <div className="w-14 h-14 rounded-full bg-[var(--accent)]/15 flex items-center justify-center overflow-hidden border-2 border-[var(--accent)]/20">
              {user.profile_picture ? (
                <Image
                  src={user.profile_picture}
                  alt={displayName || "User avatar"}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-lg font-bold text-[var(--accent)]">
                  {getInitials(displayName)}
                </span>
              )}
            </div>
          </Link>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-[var(--foreground)] truncate">
                {displayName}
              </h3>
              {user.username && (
                <span className="text-xs text-[var(--foreground)]/40">
                  @{user.username}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {user.profession && (
                <span className="flex items-center gap-1 text-xs text-[var(--foreground)]/60">
                  <Briefcase size={12} />
                  {user.profession}
                </span>
              )}
              {user.location && (
                <span className="flex items-center gap-1 text-xs text-[var(--foreground)]/60">
                  <MapPin size={12} />
                  {user.location}
                </span>
              )}
            </div>

            {/* Rating Row */}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1.5">
                {renderStars(user.average_rating)}
                <span className="text-sm font-semibold text-[var(--foreground)]">
                  {user.average_rating.toFixed(1)}
                </span>
              </div>
              <span className="text-xs text-[var(--foreground)]/40">
                {user.total_testimonials} {user.total_testimonials === 1 ? "testimonial" : "testimonials"}
              </span>
            </div>
          </div>

          {/* Expand Toggle */}
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="flex-shrink-0 p-2 rounded-full hover:bg-[var(--foreground)]/5 transition-colors text-[var(--foreground)]/40"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            <ChevronDown
              size={18}
              className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-[var(--foreground)]/10">
          <div className="pt-4 space-y-4">
            {/* Job Title */}
            {user.job_title && (
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-[var(--accent)]" />
                <span className="text-sm text-[var(--foreground)]/70">
                  {user.job_title}
                </span>
              </div>
            )}

            {/* Highest Rated Testimonial Preview */}
            {highestTestimonial && (
              <div className="rounded-xl bg-[var(--foreground)]/5 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare size={14} className="text-[var(--accent)]" />
                  <span className="text-xs font-semibold text-[var(--foreground)]/60 uppercase tracking-wide">
                    Top Testimonial
                  </span>
                  {highestTestimonial.rating && (
                    <div className="flex items-center gap-0.5 ml-auto">
                      {renderStars(highestTestimonial.rating)}
                      <span className="text-xs font-medium text-[var(--foreground)]/60 ml-1">
                        {highestTestimonial.rating}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-[var(--foreground)]/80 italic leading-relaxed">
                  &ldquo;{highestTestimonial.content}&rdquo;
                </p>
                <p className="text-xs text-[var(--foreground)]/40 mt-2">
                  — {highestTestimonial.author_name}
                  {highestTestimonial.author_company && `, ${highestTestimonial.author_company}`}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <Link
                href={`/${user.username}/profile`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] hover:underline"
              >
                View Profile
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
import { User } from "./UserAndProfile";

// Testimonial Response interface (matches backend TestimonialResponse)
export interface TestimonialsProps {
  id?: string;
  username: string; // For create/update operations
  author_name: string;
  author_title: string | null;
  author_company: string | null;
  author_relationship: string | null;
  content: string;
  rating: number | null;
  author: User; // Full author details from API
  created_at: string; // ISO datetime string
  [key: string]: string | number | boolean | null | undefined | User;
}

// For creating testimonials (matches backend TestimonialCreate)
export interface TestimonialCreate {
  username: string;
  author_name: string;
  author_title: string;
  author_company: string;
  author_relationship: string;
  content: string;
  rating: number;
  [key: string]: string | number;
}

// For updating testimonials (matches backend TestimonialUpdate)
export interface TestimonialUpdate {
  username: string;
  author_name?: string;
  author_title?: string;
  author_company?: string;
  author_relationship?: string;
  content?: string;
  rating?: number;
}

// Testimonial Stats (matches backend)
export interface TestimonialStats {
  total_testimonials: number;
  average_rating: number;
  testimonials_with_rating: number;
}

// Testimonial Summary (matches backend)
export interface TestimonialSummary {
  stats: TestimonialStats;
  recent_testimonials: TestimonialsProps[];
  username: string;
  user_id: string;
}

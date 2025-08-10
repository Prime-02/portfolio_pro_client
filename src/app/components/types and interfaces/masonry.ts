export type DistributionStrategy =
  | "center-out"
  | "left-to-right"
  | "right-to-left"
  | "balanced"
  | "random";

export type AlignItems = "start" | "center" | "end" | "stretch" | "baseline";
export type JustifyContent =
  | "start"
  | "center"
  | "end"
  | "between"
  | "around"
  | "evenly";

export interface ResponsiveColumns {
  base?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
  "2xl"?: number;
}

export interface DataMapping {
  imageUrl: string;
  title?: string;
  description?: string;
  id?: string;
  [key: string]: string | undefined;
}

export interface PaginationConfig {
  page?: number;
  size?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  totalPages?: number;
  totalItems?: number;
}
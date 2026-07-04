// ── components/CVGenerator/types.ts ────────────────────────────────────────
export type ComplexityMode = "one-pager" | "standard" | "detailed" | "custom";
export type ToneMode = "professional" | "creative" | "minimal";
export type CVSource = "default" | "portfolio";

// Per-section field-level visibility overrides, only applied when
// complexity === "custom". Keyed by CV section id (e.g. "experience",
// "education"), then by visibility flag name (e.g. "showJobTitle") from
// constants.ts's VISIBILITY_FIELDS. A key that's absent falls back to
// "visible" (true) — only explicit `false` hides a field.
export type CustomVisibilityConfig = Record<string, Record<string, boolean>>;

export interface CVConfigProps {
  complexity: ComplexityMode;
  tone: ToneMode;
  sections: string[];
  source: CVSource;
  selectedPortfolioId: string | null;
  loading: boolean;
  error: string | null;
  customVisibility: CustomVisibilityConfig;
  onComplexityChange: (mode: ComplexityMode) => void;
  onToneChange: (tone: ToneMode) => void;
  onSectionsChange: (sections: string[]) => void;
  onSourceChange: (source: CVSource) => void;
  onPortfolioChange: (portfolioId: string | null) => void;
  onCustomVisibilityChange: (config: CustomVisibilityConfig) => void;
  onGenerate: () => void;
  portfolios: Array<{ slug: string; name: string; is_default?: boolean }>;
  portfolioLoading: boolean;
  portfolioError: string | null;
}

export interface CVPreviewProps {
  cvHtml: string | null;
  complexity: ComplexityMode;
  tone: ToneMode;
  sections: string[];
  source: CVSource;
  error: string | null;
  onReconfigure: () => void;
  profileName?: string;
}

// Portfolio section types from layout data
export interface PortfolioSectionData {
  type: string;
  data: Record<string, unknown>;
}

export interface PortfolioLayoutData {
  sections?: PortfolioSectionData[];
}

// Normalized profile for CV generation
export interface CVProfile {
  name: string;
  headline?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  timezone?: string | null;
  bio?: string | null;
  availableForWork?: boolean;
  availabilityNote?: string | null;
  yearsExperience?: number | null;
  // Store data arrays
  experiences?: any[];
  educations?: any[];
  skills?: any[];
  certifications?: any[];
  socialLinks?: any[];
}

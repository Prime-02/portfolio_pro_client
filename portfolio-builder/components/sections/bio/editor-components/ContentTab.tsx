// portfolio-builder/components/sections/bio/editor-components/ContentTab.tsx

import { useState, useEffect, useRef } from "react";
import {
  BioData,
  BioStatus,
  AvailabilityStatus,
  BioLanguage,
  BioContact,
} from "@/portfolio-builder/types/bio";
import Field from "./Field";
import SelectField from "./SelectField";
import { inputClass, textareaClass, sectionClass, sectionTitleClass } from "./styles";
import MarkdownEditor from "@/src/app/components/markdown/MarkdownEditor";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { PBDropdown, PBTextInput } from "@/portfolio-builder/components/shared/ui/inputs";
import AIAssistant from "@/src/app/components/ai/AIAsistant";
import { getBioPromptOptions } from "@/src/app/components/profile/edit-components/form/bioPromptOptions";
import { toast } from "@/src/context/Toastify";


interface ContentTabProps {
  data: BioData;
  onChange: <K extends keyof BioData>(key: K, value: BioData[K]) => void;
}

// ─── Availability options ──────────────────────────────────────────────────

const AVAILABILITY_OPTIONS: { value: AvailabilityStatus; label: string; color: string }[] = [
  { value: "open-to-work", label: "Open to Work", color: "#22c55e" },
  { value: "freelancing", label: "Freelancing", color: "#3b82f6" },
  { value: "hiring", label: "Hiring", color: "#8b5cf6" },
  { value: "open-to-collaborate", label: "Open to Collaborate", color: "#f59e0b" },
  { value: "not-available", label: "Not Available", color: "#ef4444" },
];

const LANGUAGE_PROFICIENCY_OPTIONS = [
  { id: "native", code: "Native" },
  { id: "fluent", code: "Fluent" },
  { id: "conversational", code: "Conversational" },
  { id: "basic", code: "Basic" },
];

const CONTACT_TYPE_OPTIONS = [
  { id: "email", code: "Email" },
  { id: "phone", code: "Phone" },
  { id: "website", code: "Website" },
];

// ─── Collapsible Section ───────────────────────────────────────────────────

function CollapsibleSection({
  label,
  children,
  defaultOpen = false,
}: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className="rounded-sm overflow-hidden"
      style={{
        border: "1px solid color-mix(in srgb, var(--foreground) 8%, transparent)",
        backgroundColor: "color-mix(in srgb, var(--foreground) 2%, transparent)",
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-left transition-colors duration-150"
        style={{
          backgroundColor: isOpen
            ? "color-mix(in srgb, var(--foreground) 4%, transparent)"
            : "transparent",
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = "color-mix(in srgb, var(--foreground) 3%, transparent)";
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = "transparent";
          }
        }}
      >
        <span
          className="text-[10px] tracking-[0.15em] font-mono uppercase"
          style={{ opacity: 0.5 }}
        >
          {label}
        </span>
        <span
          className="text-[10px] transition-transform duration-200"
          style={{
            opacity: 0.4,
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="px-3 pb-3 flex flex-col gap-3">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export default function ContentTab({ data, onChange }: ContentTabProps) {
  const { userInfo, profile } = useUserSettings();
  const hasAutoPopulated = useRef(false);

  const handleEmptyClick = () => {
    const missingFields = [];
    if (!data.headline) missingFields.push("Job Title");
    if (!data.yearsExperience) missingFields.push("Years of Experience");

    if (missingFields.length > 0) {
      toast.warning(
        `Please complete your profile details to unlock AI bio suggestions. Missing: ${missingFields.join(", ")}`,
        {
          title: "Incomplete Profile",
        }
      );
    } else {
      toast.info(
        "Start typing a bio to enable AI-powered suggestions and improvements",
        {
          title: "Start Writing",
        }
      );
    }
  };


  // ── Auto-populate fields from profile and userInfo on first load ────────
  useEffect(() => {
    if (hasAutoPopulated.current) return;

    const updates: Partial<BioData> = {};

    // Auto-populate from profile
    if (profile) {
      if (profile.bio && !data.bio) {
        updates.bio = profile.bio;
      }
      if (profile.job_title && !data.headline) {
        updates.headline = profile.job_title;
      }
      if (profile.location && !data.location) {
        updates.location = profile.location;
      }
      if (profile.years_of_experience !== null && profile.years_of_experience !== undefined && !data.yearsExperience) {
        updates.yearsExperience = profile.years_of_experience;
      }

      // Auto-populate availability status
      if (profile.open_to_work && !data.status?.type) {
        updates.status = {
          label: profile.availability || "Available for work",
          type: profile.availability
            ? (profile.availability.toLowerCase().replace(/\s+/g, '-') as AvailabilityStatus)
            : "open-to-work"
        };
      } else if (profile.availability && !data.status?.type) {
        updates.status = {
          label: profile.availability,
          type: "open-to-work"
        };
      }

      // Auto-populate website as contact
      if (profile.website_url && (!data.contacts || data.contacts.length === 0)) {
        updates.contacts = [{
          type: "website",
          value: profile.website_url,
          isPrimary: true
        }];
      }
    }

    // Auto-populate from userInfo
    if (userInfo) {
      // Auto-populate email as primary contact
      if (userInfo.email) {
        const existingContacts = updates.contacts || data.contacts || [];
        const hasEmail = existingContacts.some(c => c.type === "email");

        if (!hasEmail) {
          const emailContact: BioContact = {
            type: "email",
            value: userInfo.email,
            isPrimary: !existingContacts.some(c => c.isPrimary)
          };
          updates.contacts = [...existingContacts, emailContact];
        }
      }

      // Auto-populate phone as contact
      if (userInfo.phone_number) {
        const existingContacts = updates.contacts || data.contacts || [];
        const hasPhone = existingContacts.some(c => c.type === "phone");

        if (!hasPhone) {
          const phoneContact: BioContact = {
            type: "phone",
            value: userInfo.phone_number,
            isPrimary: !existingContacts.some(c => c.isPrimary)
          };
          updates.contacts = [...existingContacts, phoneContact];
        }
      }
    }

    // Apply updates if there are any
    if (Object.keys(updates).length > 0) {
      Object.entries(updates).forEach(([key, value]) => {
        onChange(key as keyof BioData, value as BioData[keyof BioData]);
      });
    }

    hasAutoPopulated.current = true;
  }, [profile, userInfo]);

  // ── Status helpers ───────────────────────────────────────────────────────
  const updateStatus = (updates: Partial<BioStatus>) => {
    onChange("status", { ...data.status || { label: "Available for work", type: "open-to-work" }, ...updates });
  };

  // ── Language helpers ─────────────────────────────────────────────────────
  const addLanguage = () => {
    const newLang: BioLanguage = { language: "", proficiency: "fluent" };
    onChange("languages", [...(data.languages || []), newLang]);
  };

  const updateLanguage = (index: number, updates: Partial<BioLanguage>) => {
    const updated = [...(data.languages || [])];
    updated[index] = { ...updated[index], ...updates };
    onChange("languages", updated);
  };

  const removeLanguage = (index: number) => {
    onChange("languages", (data.languages || []).filter((_, i) => i !== index));
  };

  // ── Contact helpers ──────────────────────────────────────────────────────
  const addContact = () => {
    const newContact: BioContact = { type: "email", value: "" };
    onChange("contacts", [...(data.contacts || []), newContact]);
  };

  const updateContact = (index: number, updates: Partial<BioContact>) => {
    const updated = [...(data.contacts || [])];
    updated[index] = { ...updated[index], ...updates };
    onChange("contacts", updated);
  };

  const removeContact = (index: number) => {
    onChange("contacts", (data.contacts || []).filter((_, i) => i !== index));
  };

  // ── Metadata helpers ─────────────────────────────────────────────────────
  const addMetadata = () => {
    onChange("metadata", [...(data.metadata || []), { key: "", value: "" }]);
  };

  const updateMetadata = (index: number, updates: Partial<{ key: string; value: string }>) => {
    const updated = [...(data.metadata || [])];
    updated[index] = { ...updated[index], ...updates };
    onChange("metadata", updated);
  };

  const removeMetadata = (index: number) => {
    onChange("metadata", (data.metadata || []).filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-5">
      {/* ── Headline ── */}
      <PBTextInput
        label="Headline"
        id="headline"
        value={data.headline || ""}
        onChange={(value) => onChange("headline", value)}
        placeholder='e.g. "Building digital experiences for 8 years"'
        desc="Short punchy statement about yourself"
      />

      <div className="relative">
        <MarkdownEditor
          value={data.bio || ""}
          onChange={(value) => onChange("bio", value)}
          placeholder="Tell others about yourself, your experience, and what you're passionate about..."
          minHeight="200px"
          showCopy={false}
          showDownload={false}
        />
        <div className="absolute bottom-0 right-0">
          <AIAssistant
            options={getBioPromptOptions({
              currentText: data.bio || "",
              profession: data.headline || "Unavailable",
              jobTitle: data.status?.label || "Unavailable",
              yearsOfExperience: data.yearsExperience ? String(data.yearsExperience) : "Unavailable",
            })}
            onEmptyClick={handleEmptyClick}
            onChange={(e) => {
              onChange("bio", e)
              toast.info("The AI has finished processing your request. Please review the output before saving.", {
                title: "Prompt Ready",
              })
            }}
          />
        </div>
      </div>
      {/* ── Location ── */}
      <PBTextInput
        label="Location"
        id="location"
        value={data.location || ""}
        onChange={(value) => onChange("location", value)}
        placeholder='e.g. "San Francisco, CA" or "Remote"'
        desc="City, Country or Remote"
      />

      {/* ── Years of Experience ── */}
      <PBTextInput
        label="Years of Experience"
        id="yearsExperience"
        type="number"
        value={data.yearsExperience || 0}
        onChange={(value) => onChange("yearsExperience", Number(value))}
        inputMode="numeric"
        min={0}
        max={60}
      />

      {/* ── Availability Status ── */}
      <div className={sectionClass}>
        <h3 className={sectionTitleClass}>Availability Status</h3>

        <PBDropdown
          id="statusType"
          label="Status"
          value={data.status?.type || "open-to-work"}
          onSelect={(value) => updateStatus({ type: value as AvailabilityStatus })}
          options={AVAILABILITY_OPTIONS.map((o) => ({ id: o.value, code: o.label }))}
          placeholder="Select availability status"
        />

        <PBTextInput
          label="Custom Label (optional)"
          id="statusLabel"
          value={data.status?.label || ""}
          onChange={(value) => updateStatus({ label: value })}
          placeholder={`Default: ${AVAILABILITY_OPTIONS.find((o) => o.value === data.status?.type)?.label || "Open to Work"}`}
          desc="Override the default status text"
        />
      </div>

      {/* ── Languages ── */}
      <CollapsibleSection label="Languages">
        <div className="space-y-3">
          {(data.languages || []).length === 0 && (
            <p className="text-xs text-foreground/40">No languages added yet.</p>
          )}
          {(data.languages || []).map((lang, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="flex-1">
                <PBTextInput
                  label="Language"
                  id={`lang-${index}`}
                  value={lang.language}
                  onChange={(value) => updateLanguage(index, { language: value })}
                  placeholder="e.g. English"
                />
              </div>
              <div className="w-32">
                <PBDropdown
                  id={`lang-level-${index}`}
                  label="Level"
                  value={lang.proficiency}
                  onSelect={(value) => updateLanguage(index, { proficiency: value as BioLanguage["proficiency"] })}
                  options={LANGUAGE_PROFICIENCY_OPTIONS}
                  placeholder="Select level"
                />
              </div>
              <button
                type="button"
                onClick={() => removeLanguage(index)}
                className="mt-6 text-xs text-foreground/40 hover:text-red-500 transition-colors px-2"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addLanguage}
            className="text-sm text-foreground/50 hover:text-foreground transition-colors"
          >
            + Add Language
          </button>
        </div>
      </CollapsibleSection>

      {/* ── Contact Methods ── */}
      <CollapsibleSection label="Contact Methods">
        <div className="space-y-3">
          {(data.contacts || []).length === 0 && (
            <p className="text-xs text-foreground/40">No contact methods added.</p>
          )}
          {(data.contacts || []).map((contact, index) => (
            <div key={index} className="border border-foreground/15 rounded-lg p-3 space-y-3">
              <div className="flex gap-2 items-start">
                <div className="w-28">
                  <PBDropdown
                    id={`contact-type-${index}`}
                    label="Type"
                    value={contact.type}
                    onSelect={(value) => updateContact(index, { type: value as BioContact["type"] })}
                    options={CONTACT_TYPE_OPTIONS}
                    placeholder="Select type"
                  />
                </div>
                <div className="flex-1">
                  <PBTextInput
                    label="Value"
                    id={`contact-value-${index}`}
                    type={contact.type === "phone" ? "text" : contact.type === "email" ? "email" : "text"}
                    value={contact.value}
                    onChange={(value) => updateContact(index, { value: value })}
                    placeholder={contact.type === "email" ? "you@example.com" : contact.type === "phone" ? "+1 234 567 890" : "https://..."}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeContact(index)}
                  className="mt-6 text-xs text-foreground/40 hover:text-red-500 transition-colors px-2"
                >
                  ✕
                </button>
              </div>
              <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={contact.isPrimary || false}
                    onChange={(e) => updateContact(index, { isPrimary: e.target.checked })}
                    className="rounded border-foreground/30 bg-foreground/10 text-foreground"
                  />
                  <span className="text-xs text-foreground/50">Primary contact</span>
                </label>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={addContact}
            className="text-sm text-foreground/50 hover:text-foreground transition-colors"
          >
            + Add Contact Method
          </button>
        </div>
      </CollapsibleSection>

      {/* ── Metadata / Fun Facts ── */}
      <CollapsibleSection label="Fun Facts & Metadata">
        <div className="space-y-3">
          {(data.metadata || []).length === 0 && (
            <p className="text-xs text-foreground/40">No metadata added.</p>
          )}
          {(data.metadata || []).map((meta, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="w-1/3">
                <PBTextInput
                  label="Label"
                  id={`meta-key-${index}`}
                  value={meta.key}
                  onChange={(value) => updateMetadata(index, { key: value })}
                  placeholder="e.g. Coffee"
                  desc="e.g. Favorite Tool, Pets, Side Project, Reading"
                />
              </div>
              <div className="flex-1">
                <PBTextInput
                  label="Value"
                  id={`meta-value-${index}`}
                  value={meta.value}
                  onChange={(value) => updateMetadata(index, { value: value })}
                  placeholder="e.g. 5 cups/day"
                  desc="e.g. VS Code, 2 dogs & a cat, Open source contributor, 52 books/year"
                />
              </div>
              <button
                type="button"
                onClick={() => removeMetadata(index)}
                className="mt-6 text-xs text-foreground/40 hover:text-red-500 transition-colors px-2"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addMetadata}
            className="text-sm text-foreground/50 hover:text-foreground transition-colors"
          >
            + Add Fun Fact
          </button>
        </div>
      </CollapsibleSection>
    </div>
  );
}
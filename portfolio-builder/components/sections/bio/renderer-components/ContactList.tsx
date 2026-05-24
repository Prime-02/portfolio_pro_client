// portfolio-builder/components/sections/bio/renderer-components/ContactList.tsx

import { BioContact } from "@/portfolio-builder/types/bio";

interface ContactListProps {
  contacts?: BioContact[];
  className?: string;
}

const CONTACT_ICONS: Record<BioContact["type"], string> = {
  email: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
  phone: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
  website: "M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9",
  calendly: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
};

const CONTACT_LABELS: Record<BioContact["type"], string> = {
  email: "Email",
  phone: "Phone",
  website: "Website",
  calendly: "Schedule a Call",
};

export function ContactList({ contacts, className = "" }: ContactListProps) {
  if (!contacts || contacts.length === 0) return null;

  const primaryContact = contacts.find((c) => c.isPrimary) || contacts[0];

  return (
    <div className={`space-y-3 ${className}`}>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--pb-text-muted)]">
        Contact
      </h4>
      <div className="flex flex-wrap gap-2">
        {contacts.map((contact, index) => {
          const href =
            contact.type === "email"
              ? `mailto:${contact.value}`
              : contact.type === "phone"
                ? `tel:${contact.value}`
                : contact.value;

          return (
            <a
              key={index}
              href={href}
              target={contact.type === "website" || contact.type === "calendly" ? "_blank" : undefined}
              rel={contact.type === "website" || contact.type === "calendly" ? "noopener noreferrer" : undefined}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${contact.isPrimary || contact === primaryContact
                  ? "bg-[var(--pb-foreground)] text-[var(--pb-background)] hover:opacity-90"
                  : "bg-[var(--pb-surface-elevated)] text-[var(--pb-text-primary)] hover:bg-[var(--pb-surface-hover)] border border-[var(--pb-border)]"
                }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={CONTACT_ICONS[contact.type]} />
              </svg>
              <span>{contact.label || CONTACT_LABELS[contact.type]}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
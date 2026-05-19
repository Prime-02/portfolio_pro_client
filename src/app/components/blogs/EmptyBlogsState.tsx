"use client";

import { motion } from "framer-motion";
import { BookOpen, Plus, PenLine, Lightbulb, Newspaper, ScrollText, Feather } from "lucide-react";
import { useRouter } from "next/navigation";
import Button from "../buttons/Buttons";

interface EmptyBlogsStateProps {
  isOwner: boolean;
  username?: string;
}

const EXAMPLE_TOPICS = [
  "Getting Started with React",
  "Design Systems 101",
  "API Best Practices",
  "DevOps for Beginners",
  "UI Animation Tips",
  "Database Optimization",
];

const CATEGORY_ICONS = [
  <PenLine key="pen" className="w-5 h-5" />,
  <Lightbulb key="idea" className="w-5 h-5" />,
  <Newspaper key="news" className="w-5 h-5" />,
  <ScrollText key="scroll" className="w-5 h-5" />,
  <Feather key="feather" className="w-5 h-5" />,
];

export function EmptyBlogsState({ isOwner, username }: EmptyBlogsStateProps) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 px-4"
    >
      <div className="relative p-5 rounded-2xl bg-[var(--accent)]/10 mb-6">
        <BookOpen className="w-12 h-12 text-[var(--accent)]" />
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[var(--accent)]/20 flex items-center justify-center"
        >
          <Plus className="w-3 h-3 text-[var(--accent)]" />
        </motion.div>
      </div>

      <h2 className="text-2xl font-league-600 mb-2">
        {isOwner ? "No posts yet" : "Nothing to read"}
      </h2>
      <p className="text-[var(--foreground)]/60 text-center max-w-sm mb-8">
        {isOwner
          ? "Start writing — share your knowledge, stories, and insights with the world."
          : `${username || "This user"} hasn't published any posts yet.`}
      </p>

      {isOwner && (
        <Button
          onClick={() => router.push("blogs/create")}
          size="lg"
          icon={<PenLine className="w-5 h-5" />}
          text="Write Your First Post"
        />
      )}

      {isOwner && (
        <div className="mt-12 flex flex-wrap justify-center gap-3 max-w-lg">
          {EXAMPLE_TOPICS.map((topic, i) => (
            <motion.div
              key={topic}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--foreground)]/5
                         border border-[var(--foreground)]/5 text-sm text-[var(--foreground)]/50"
            >
              {CATEGORY_ICONS[i % CATEGORY_ICONS.length]}
              {topic}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

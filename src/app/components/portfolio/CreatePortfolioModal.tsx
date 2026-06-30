import React, { useState, useEffect } from "react"
import type { PortfolioCreate } from "@/portfolio-builder/store/usePortfolioStore"
import Modal from "../containers/modals/Modal"

interface CreatePortfolioModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: PortfolioCreate) => void
  isLoading: boolean
}

const CreatePortfolioModal = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: CreatePortfolioModalProps) => {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isPublic, setIsPublic] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const reset = () => {
    setName("")
    setDescription("")
    setIsPublic(true)
    setErrors({})
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = "Portfolio name is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      is_public: isPublic,
    })
  }

  useEffect(() => {
    if (isOpen) reset()
  }, [isOpen])

  return (
    <Modal title="Create New Portfolio" isOpen={isOpen} onClose={handleClose}>
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-1.5">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (errors.name) setErrors((prev) => ({ ...prev, name: "" }))
            }}
            placeholder="My Awesome Portfolio"
            className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--foreground)]/20 rounded-lg text-[var(--foreground)] placeholder:text-[var(--foreground)]/30 focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)]/80 mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of your portfolio..."
            rows={3}
            className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--foreground)]/20 rounded-lg text-[var(--foreground)] placeholder:text-[var(--foreground)]/30 focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all resize-none"
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border border-[var(--foreground)]/10">
          <div>
            <p className="text-sm font-medium text-[var(--foreground)]">Public Portfolio</p>
            <p className="text-xs text-[var(--foreground)]/50">Visible to everyone on the platform</p>
          </div>
          <button
            type="button"
            onClick={() => setIsPublic(!isPublic)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${isPublic ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20"
              }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-[var(--background)] rounded-full transition-transform duration-200 ${isPublic ? "translate-x-5" : "translate-x-0"
                }`}
            />
          </button>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium border border-[var(--foreground)]/20 text-[var(--foreground)] rounded-lg hover:bg-[var(--foreground)]/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-sm font-medium bg-[var(--accent)] text-[var(--background)] rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creating..." : "Create Portfolio"}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default CreatePortfolioModal
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Users,
  Plus,
  Shield,
  Pencil,
  Trash2,
  Check,
} from "lucide-react";
import { useCollaboratorStore } from "@/lib/stores/projects/useCollaboratorStore";
import { useProjectStore } from "@/lib/stores/projects/useProjectsStore";
import type {
  CollaboratorResponse,
  CollaboratorUpdate,
} from "@/lib/stores/projects/types/project.types";
import Button from "../buttons/Buttons";
import { ErrorMessage } from "../ui/ErrorMessage";
import { Textinput } from "../inputs/Textinput";
import Modal from "../containers/modals/Modal";
import { UsernameField } from "../profile/edit-components/UsernameField";
import { useUserSettings } from "@/lib/stores/user/useUserSettings";
import { TextArea } from "../inputs/TextArea";

export default function CollaboratorManagerPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.project as string;

  const {
    collaboratorsByProject,
    totalByProject,
    fetchCollaborators,
    addCollaborator,
    updateCollaborator,
    removeCollaborator,
    loading,
    errors,
  } = useCollaboratorStore();

  const { projects, currentProject } = useProjectStore();
  const { userInfo } = useUserSettings();
  const project = currentProject || projects.find((p) => p.id === projectId);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingCollaborator, setEditingCollaborator] =
    useState<CollaboratorResponse | null>(null);
  const [deletingCollaborator, setDeletingCollaborator] =
    useState<CollaboratorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Add form
  const [newUsername, setNewUsername] = useState("");
  const [newUsernameValid, setNewUsernameValid] = useState(false);
  const [newRole, setNewRole] = useState("collaborator");
  const [newCanEdit, setNewCanEdit] = useState(false);
  const [newContribution, setNewContribution] = useState("");

  // Edit form — mirrors the selected collaborator's current values
  const [editRole, setEditRole] = useState("");
  const [editCanEdit, setEditCanEdit] = useState(false);
  const [editContribution, setEditContribution] = useState("");

  const collaborators = collaboratorsByProject[projectId] || [];

  // Derive the set of creator user_ids from user_associations on the full
  // project response. UserAssociationResponse.role is typed as ProjectRole
  // which includes "creator", so this is the authoritative source.
  const creatorIds = new Set(
    (project?.user_associations ?? [])
      .filter((a) => a.role === "creator")
      .map((a) => a.user_id)
  );

  const isCreator = (c: CollaboratorResponse) => creatorIds.has(c.user_id);

  useEffect(() => {
    if (projectId) fetchCollaborators(projectId);
  }, [projectId]);

  useEffect(() => {
    const err =
      errors.fetchCollaborators ||
      errors.addCollaborator ||
      errors.updateCollaborator ||
      errors.removeCollaborator;
    if (err) setError(err);
  }, [errors]);

  const handleAdd = async () => {
    if (!newUsername.trim() || !newUsernameValid) return;
    const success = await addCollaborator(projectId, {
      username: newUsername.trim(),
      role: newRole,
      can_edit: newCanEdit,
      contribution_description: newContribution || null,
    });
    if (success) {
      setShowAddDialog(false);
      resetAddForm();
    }
  };

  const handleUpdate = async () => {
    if (!editingCollaborator?.username) return;

    // Build a sparse patch — only include fields that actually changed
    const patch: CollaboratorUpdate = {};

    if (editRole !== editingCollaborator.role) {
      patch.role = editRole;
    }
    if (editCanEdit !== editingCollaborator.can_edit) {
      patch.can_edit = editCanEdit;
    }
    const originalDesc = editingCollaborator.contribution_description ?? "";
    if (editContribution !== originalDesc) {
      patch.contribution_description = editContribution || null;
    }

    // Nothing changed — close silently without a network round-trip
    if (Object.keys(patch).length === 0) {
      setEditingCollaborator(null);
      return;
    }

    await updateCollaborator(projectId, editingCollaborator.username, patch);
    setEditingCollaborator(null);
  };

  const handleDelete = async () => {
    if (!deletingCollaborator?.username) return;
    await removeCollaborator(projectId, deletingCollaborator.username);
    setDeletingCollaborator(null);
  };

  const startEdit = (collaborator: CollaboratorResponse) => {
    setEditingCollaborator(collaborator);
    setEditRole(collaborator.role);
    setEditCanEdit(collaborator.can_edit);
    setEditContribution(collaborator.contribution_description ?? "");
  };

  const resetAddForm = () => {
    setNewUsername("");
    setNewUsernameValid(false);
    setNewRole("collaborator");
    setNewCanEdit(false);
    setNewContribution("");
  };

  const roleOptions = [
    { id: "owner", code: "Owner" },
    { id: "collaborator", code: "Collaborator" },
    { id: "viewer", code: "Viewer" },
  ];

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[var(--foreground)]/30">Project not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--foreground)]/5">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <button
            onClick={() =>
              router.back()
            }
            className="flex items-center gap-2 text-sm text-[var(--foreground)]/60 hover:text-[var(--accent)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <div>
            <Button
              size="sm"
              onClick={() => {
                resetAddForm();
                setShowAddDialog(true);
              }}
              icon={<Plus className="w-4 h-4" />}
              text="Add Member"
            />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-league-700 mb-1">Team Management</h1>
          <p className="text-[var(--foreground)]/50 mb-2">
            {project.project_name}
          </p>
          <p className="text-sm text-[var(--foreground)]/40 mb-8">
            {totalByProject[projectId] ?? collaborators.length} member
            {totalByProject[projectId] !== 1 ? "s" : ""}
          </p>

          {error && (
            <ErrorMessage message={error} onDismiss={() => setError(null)} />
          )}

          <div className="space-y-3">
            <AnimatePresence>
              {collaborators.map((collaborator, i) => {
                const creator = isCreator(collaborator);
                return (
                  <motion.div
                    key={collaborator.user_id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-xl border border-[var(--foreground)]/10
                      bg-[var(--background)] hover:border-[var(--accent)]/20 transition-colors"
                  >
                    {collaborator.profile_picture ? (
                      <Image
                        src={collaborator.profile_picture}
                        alt={collaborator.username ?? `Collaborator ${i + 1}`}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-[var(--accent)]">
                          {collaborator.username?.[0]?.toUpperCase() ?? "?"}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium truncate">
                          {collaborator.username ?? "Unknown"}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium
                            ${creator
                              ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                              : "bg-[var(--foreground)]/5 text-[var(--foreground)]/50"
                            }`}
                        >
                          <Shield className="w-2.5 h-2.5" />
                          {creator ? "Creator" : collaborator.role}
                        </span>
                        {collaborator.can_edit && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-500">
                            <Pencil className="w-2.5 h-2.5" />
                            Can Edit
                          </span>
                        )}
                      </div>
                      {collaborator.contribution_description && (
                        <p className="text-xs text-[var(--foreground)]/40 mt-1 line-clamp-1">
                          {collaborator.contribution_description}
                        </p>
                      )}
                    </div>

                    {/* Edit/delete actions are hidden for the project creator */}
                    {!creator && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          title="Edit collaborator"
                          onClick={() => startEdit(collaborator)}
                          className="p-2 rounded-lg hover:bg-[var(--foreground)]/5 transition-colors"
                        >
                          <Pencil className="w-4 h-4 text-[var(--foreground)]/40" />
                        </button>
                        <button
                          title="Remove collaborator"
                          onClick={() => setDeletingCollaborator(collaborator)}
                          className="p-2 rounded-lg hover:bg-red-500/5 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500/60" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {collaborators.length === 0 && !loading.fetchCollaborators && (
            <div className="text-center py-12 text-[var(--foreground)]/30">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No collaborators yet</p>
              <p className="text-xs mt-1">Add team members to collaborate</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Add Collaborator Modal */}
      <Modal
        isOpen={showAddDialog}
        onClose={() => {
          setShowAddDialog(false);
          resetAddForm();
        }}
        title={
          <>
            <h2 className="text-xl font-league-600 mb-1">Add Collaborator</h2>
            <p className="text-sm text-[var(--foreground)]/50">
              Invite a team member to this project
            </p>
          </>
        }
      >
        <div className="space-y-4">
          <UsernameField
            value={newUsername}
            onChange={setNewUsername}
            placeholder="Enter username to add"
            mode="existence"
            onValidationChange={setNewUsernameValid}
          />
          <Textinput
            type="dropdown"
            label="Role"
            options={roleOptions}
            value={newRole}
            onChange={setNewRole}
          />
          <TextArea
            label="Contribution Description"
            desc="What will they work on?"
            value={newContribution}
            onChange={setNewContribution}
            placeholder="e.g., Frontend development, UI design"
          />
          <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--foreground)]/10">
            <div>
              <p className="text-sm font-medium">Can Edit</p>
              <p className="text-xs text-[var(--foreground)]/40">
                Allow editing project details
              </p>
            </div>
            <button
              title="Toggle can edit"
              type="button"
              onClick={() => setNewCanEdit(!newCanEdit)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${newCanEdit ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${newCanEdit ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <Button
            variant="ghost"
            onClick={() => {
              setShowAddDialog(false);
              resetAddForm();
            }}
            text="Cancel"
          />
          <Button
            onClick={handleAdd}
            disabled={
              !newUsername.trim() ||
              !newUsernameValid ||
              loading.addCollaborator
            }
            loading={loading.addCollaborator}
            icon={<Plus className="w-4 h-4" />}
            text="Add Member"
          />
        </div>
      </Modal>

      {/* Edit Collaborator Modal */}
      <Modal
        isOpen={!!editingCollaborator}
        onClose={() => setEditingCollaborator(null)}
        title={
          <>
            <h2 className="text-xl font-league-600 mb-1">Edit Permissions</h2>
            <p className="text-sm text-[var(--foreground)]/50">
              {editingCollaborator?.username}
            </p>
          </>
        }
      >
        <div className="space-y-4">
          <Textinput
            label="Username"
            value={editingCollaborator?.username || ""}
            onChange={() => { }}
            disabled
            desc="Username cannot be changed"
          />
          <Textinput
            type="dropdown"
            label="Role"
            options={roleOptions}
            value={editRole}
            onChange={setEditRole}
          />
          <TextArea
            label="Contribution Description"
            value={editContribution}
            onChange={setEditContribution}
            placeholder="e.g., Frontend development, UI design"
          />
          <div className="flex items-center justify-between p-3 rounded-xl border border-[var(--foreground)]/10">
            <div>
              <p className="text-sm font-medium">Can Edit</p>
              <p className="text-xs text-[var(--foreground)]/40">
                Allow editing project details
              </p>
            </div>
            <button
              title="Toggle can edit"
              type="button"
              onClick={() => setEditCanEdit(!editCanEdit)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${editCanEdit ? "bg-[var(--accent)]" : "bg-[var(--foreground)]/20"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${editCanEdit ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>
        </div>
        <div className="flex gap-3 justify-end mt-6">
          <Button
            variant="ghost"
            onClick={() => setEditingCollaborator(null)}
            text="Cancel"
          />
          <Button
            onClick={handleUpdate}
            disabled={loading.updateCollaborator}
            loading={loading.updateCollaborator}
            icon={<Check className="w-4 h-4" />}
            text="Save Changes"
          />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingCollaborator}
        onClose={() => setDeletingCollaborator(null)}
        title=""
      >
        <div className="text-center">
          <div className="mx-auto mb-3 p-3 rounded-full bg-red-500/10 w-fit">
            <Trash2 className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-xl font-league-600 mb-2">Remove Collaborator</h2>
          <p className="text-sm text-[var(--foreground)]/50 mb-6">
            Remove{" "}
            <span className="font-medium">
              {deletingCollaborator?.username}
            </span>{" "}
            from this project?
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="ghost"
              onClick={() => setDeletingCollaborator(null)}
              text="Cancel"
            />
            <Button
              onClick={handleDelete}
              disabled={loading.removeCollaborator}
              loading={loading.removeCollaborator}
              className="bg-red-500 hover:bg-red-600 text-white"
              icon={<Trash2 className="w-4 h-4" />}
              text="Remove"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
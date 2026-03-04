import Button from '@/app/components/buttons/Buttons'
import Popover from '@/app/components/containers/divs/PopOver'
import { ContentStatus } from '@/app/components/types and interfaces/Posts'
import { useGlobalState } from '@/app/globalStateProvider'
import { useContentStore } from '@/app/stores/posts_store/PostsHandler'
import { Archive, ArchiveRestore, CheckCircle, FileEdit, Trash2, AlertTriangle } from 'lucide-react'
import React from 'react'

const statusActions: {
  visibleWhen: ContentStatus[]
  label: string
  icon: React.ReactNode
  targetStatus: ContentStatus
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success'
}[] = [
    {
      visibleWhen: [ContentStatus.DRAFT, ContentStatus.ARCHIVED, ContentStatus.DELETED],
      label: "Publish",
      icon: <CheckCircle size={14} />,
      targetStatus: ContentStatus.PUBLISHED,
      variant: 'success',
    },
    {
      visibleWhen: [ContentStatus.PUBLISHED, ContentStatus.ARCHIVED, ContentStatus.DELETED],
      label: "Draft",
      icon: <FileEdit size={14} />,
      targetStatus: ContentStatus.DRAFT,
      variant: 'outline',
    },
    {
      visibleWhen: [ContentStatus.PUBLISHED, ContentStatus.DRAFT, ContentStatus.DELETED],
      label: "Archive",
      icon: <Archive size={14} />,
      targetStatus: ContentStatus.ARCHIVED,
      variant: 'outline',
    },
    {
      visibleWhen: [ContentStatus.PUBLISHED, ContentStatus.DRAFT, ContentStatus.ARCHIVED],
      label: "Move to Bin",
      icon: <ArchiveRestore size={14} />,
      targetStatus: ContentStatus.DELETED,
      variant: 'outline',
    },
  ]

const DeletePopOver = () => {
  const { bulkDeleteContent, bulkUpdateContent, filters, selectedContentIds, clearContentSelection, listContent } = useContentStore()
  const { accessToken, isLoading, setLoading, currentUser } = useGlobalState()
  const count = selectedContentIds.length

  return (
    <div className="p-4 w-64 flex flex-col gap-y-3">
      {/* Header */}
      <div className="flex items-start gap-2">
        <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
          <AlertTriangle size={15} className="text-red-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--foreground)]">
            Delete {count > 1 ? `${count} items` : '1 item'}?
          </p>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5 leading-snug">
            Choose how you'd like to remove the selected content.
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[var(--border)]" />

      {/* Actions */}
      <div className="flex flex-col gap-y-1.5">
        {filters.status !== ContentStatus.DELETED && (
          <button
            disabled={isLoading("bulk_deleting_content")}
            onClick={() =>
              bulkUpdateContent(
                accessToken,
                setLoading,
                {
                  status: ContentStatus.DELETED,
                  content_ids: selectedContentIds,
                },
                () => {
                  clearContentSelection()
                  listContent(accessToken, setLoading, {
                    page: 1,
                    username: currentUser || undefined,
                    ...filters,
                  })
                }
              )
            }
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
              text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed text-left"
          >
            <ArchiveRestore size={15} className="flex-shrink-0 opacity-60" />
            <span>Move to Bin</span>
            <span className="ml-auto text-xs text-[var(--muted-foreground)] opacity-60">Recoverable</span>
          </button>
        )}

        <button
          disabled={isLoading("bulk_deleting_content")}
          onClick={() => bulkDeleteContent(accessToken, setLoading, true)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm
            text-red-500 hover:bg-red-50 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed text-left font-medium"
        >
          <Trash2 size={15} className="flex-shrink-0" />
          <span>Delete Permanently</span>
          <span className="ml-auto text-xs text-red-400 opacity-70">Forever</span>
        </button>
      </div>
    </div>
  )
}

const SelectedContentsActions = () => {
  const { bulkUpdateContent, filters, selectedContentIds, clearContentSelection, listContent } = useContentStore()
  const { accessToken, isLoading, setLoading, currentUser } = useGlobalState()

  const visibleActions = filters.status
    ? statusActions.filter(action => action.visibleWhen.includes(filters.status!))
    : []

  return (
    <div className="flex items-center gap-x-1.5">
      {/* Divider before status actions */}
      {visibleActions.length > 0 && (
        <>
          {visibleActions.map(action => (
            <Button
              key={action.label}
              icon={action.icon}
              text={action.label}
              title={action.label}
              variant={action.variant}
              size="sm"
              className="w-fit !px-3 gap-1.5"
              loading={isLoading("bulk_updating_content")}
              onClick={() =>
                bulkUpdateContent(
                  accessToken,
                  setLoading,
                  {
                    status: action.targetStatus,
                    content_ids: selectedContentIds,
                  },
                  () => {
                    clearContentSelection()
                    listContent(accessToken, setLoading, {
                      page: 1,
                      username: currentUser || undefined,
                      ...filters,
                    })
                  }
                )
              }
            />
          ))}

          {/* Subtle separator */}
          <div className="h-5 w-px bg-[var(--border)] mx-0.5 opacity-60" />
        </>
      )}

      {/* Delete trigger */}
      <Popover
        closeOnInsideClick={true}
        position="bottom-right"
        clicker={
          <Button
            icon={<Trash2 size={14} />}
            text="Delete"
            title="Delete selected"
            variant="danger"
            size="sm"
            className="w-fit !px-3 gap-1.5"
          />
        }
        clickerContainerClassName={!filters.status ? "w-full" : "w-fit"}
        clickerClassName=""
      >
        <DeletePopOver />
      </Popover>
    </div>
  )
}

export default SelectedContentsActions
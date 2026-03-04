import Button from '@/app/components/buttons/Buttons'
import Popover from '@/app/components/containers/divs/PopOver'
import { ContentStatus } from '@/app/components/types and interfaces/Posts'
import { useGlobalState } from '@/app/globalStateProvider'
import { useContentStore } from '@/app/stores/posts_store/PostsHandler'
import { Archive, ArchiveRestore, CheckCircle, FileEdit, Trash } from 'lucide-react'
import React from 'react'

const statusActions: {
  visibleWhen: ContentStatus[]
  label: string
  icon: React.ReactNode
  targetStatus: ContentStatus
}[] = [
    {
      visibleWhen: [ContentStatus.DRAFT, ContentStatus.ARCHIVED, ContentStatus.DELETED],
      label: "Publish",
      icon: <CheckCircle />,
      targetStatus: ContentStatus.PUBLISHED,
    },
    {
      visibleWhen: [ContentStatus.PUBLISHED, ContentStatus.ARCHIVED, ContentStatus.DELETED],
      label: "Draft",
      icon: <FileEdit />,
      targetStatus: ContentStatus.DRAFT,
    },
    {
      visibleWhen: [ContentStatus.PUBLISHED, ContentStatus.DRAFT, ContentStatus.DELETED],
      label: "Archive",
      icon: <Archive />,
      targetStatus: ContentStatus.ARCHIVED,
    },
    // {
    //   visibleWhen: [ContentStatus.PUBLISHED, ContentStatus.DRAFT, ContentStatus.ARCHIVED],
    //   label: "Move to bin",
    //   icon: <ArchiveRestore />,
    //   targetStatus: ContentStatus.DELETED,
    // },
  ]

const SelectedContentsActions = () => {
  const { bulkDeleteContent, bulkUpdateContent, filters, selectedContentIds } = useContentStore()
  const { accessToken, isLoading, setLoading } = useGlobalState()

  const DeletePopOver = () => {
    return (
      <div className="w-full flex flex-col items-center gap-y-2">
        {filters.status !== ContentStatus.DELETED && (
          <Button
            variant="ghost"
            size="sm"
            text="Move to bin"
            loading={isLoading("bulk_deleting_content")}
            onClick={() => {
              bulkUpdateContent(accessToken, setLoading, {
                status: ContentStatus.DELETED,
                content_ids: selectedContentIds,
              })
            }}
          />
        )}
        <Button
          variant="ghost"
          size="sm"
          text="Delete Permanently"
          loading={isLoading("bulk_deleting_content")}
          onClick={() => bulkDeleteContent(accessToken, setLoading, true)}
        />
      </div>
    )
  }

  return (
    <div className='flex items-center gap-x-1'>
      {filters.status &&
        statusActions
          .filter(action => action.visibleWhen.includes(filters.status!))
          .map(action => (
            <Button
              key={action.label}
              icon={action.icon}
              title={action.label}
              variant='primary'
              size='sm'
              className="w-fit"
              loading={isLoading("bulk_updating_content")}
              onClick={() =>
                bulkUpdateContent(accessToken, setLoading, {
                  status: action.targetStatus,
                  content_ids: selectedContentIds,
                })
              }
            />
          ))}

      <Popover
        clicker={
          <Button
            icon={<Trash />}
            title={!filters.status ? "Delete" : "Delete"}
            text={!filters.status ? "Delete" : undefined}
            variant='danger'
            size='sm'
          />
        }
        className=""
        clickerContainerClassName={`${!filters.status ? "w-full" : ""}`}
        clickerClassName=""
      >
        <DeletePopOver />
      </Popover>
    </div>
  )
}

export default SelectedContentsActions
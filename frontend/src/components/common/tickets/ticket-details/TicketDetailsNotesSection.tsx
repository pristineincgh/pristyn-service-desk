import { MessageSquarePlus, Pencil, Shield, Trash2 } from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { formatUserDisplayName } from '@/lib/self-reference';
import type { TicketNote } from '@/types/ticket-types';
import { UserRole } from '@/types/user-types';
import {
  canManageNote,
  formatRelativeTimestamp,
} from './ticket-details.constants';

interface TicketDetailsNotesSectionProps {
  notes: TicketNote[];
  authUserId?: string;
  authUserRole?: UserRole;
  editingNoteId: string | null;
  editedNoteContent: string;
  editedNoteInternal: boolean;
  isUpdatingNote: boolean;
  isDeletingNote: boolean;
  notePendingDeleteId?: string;
  onAddNote: () => void;
  onBeginEdit: (note: TicketNote) => void;
  onDeleteRequest: (note: TicketNote) => void;
  onEditedNoteContentChange: (value: string) => void;
  onEditedNoteInternalChange: (value: boolean) => void;
  onSaveNote: () => void;
  onCancelEdit: () => void;
}

const TicketDetailsNotesSection = ({
  notes,
  authUserId,
  authUserRole,
  editingNoteId,
  editedNoteContent,
  editedNoteInternal,
  isUpdatingNote,
  isDeletingNote,
  notePendingDeleteId,
  onAddNote,
  onBeginEdit,
  onDeleteRequest,
  onEditedNoteContentChange,
  onEditedNoteInternalChange,
  onSaveNote,
  onCancelEdit,
}: TicketDetailsNotesSectionProps) => {
  return (
    <Card className='gap-0 overflow-hidden py-0'>
      <CardHeader className='border-b py-6'>
        <CardTitle>Notes Timeline</CardTitle>
        <CardDescription>
          Internal context, collaborator updates, and resolution notes.
        </CardDescription>
        <CardAction>
          <Button type='button' size='sm' variant='outline' onClick={onAddNote}>
            <MessageSquarePlus />
            Add note
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className='space-y-4 py-6'>
        {notes.length === 0 ? (
          <EmptyState
            icon={MessageSquarePlus}
            title='No notes yet'
            description='Add a note to capture investigation context, handoff details, or resolution updates.'
            actions={[
              {
                label: 'Add note',
                onClick: onAddNote,
              },
            ]}
          />
        ) : (
          notes.map((note) => {
            const isEditing = editingNoteId === note.id;
            const canEditNote = canManageNote(note, authUserId, authUserRole);

            return (
              <div key={note.id} className='rounded-xl border p-4 shadow-xs'>
                <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                  <div className='space-y-2'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <Badge variant='outline' className='rounded-md'>
                        {note.createdBy
                          ? formatUserDisplayName(
                              note.createdBy.name,
                              note.createdBy.id,
                              authUserId
                            )
                          : (note.createdByCustomer?.name ?? 'Unknown author')}
                      </Badge>
                      {note.isInternal ? (
                        <Badge
                          variant='outline'
                          className='rounded-md border-transparent bg-slate-100 text-slate-700'
                        >
                          <Shield className='size-3.5' />
                          Internal
                        </Badge>
                      ) : (
                        <Badge
                          variant='outline'
                          className='rounded-md border-transparent bg-emerald-100 text-emerald-700'
                        >
                          Shared
                        </Badge>
                      )}
                      {note.createdBy?.role ? (
                        <Badge variant='outline' className='rounded-md'>
                          {note.createdBy.role.replaceAll('_', ' ')}
                        </Badge>
                      ) : null}
                    </div>
                    <p className='text-xs text-muted-foreground'>
                      {formatRelativeTimestamp(note.createdAt)}
                    </p>
                  </div>

                  {canEditNote ? (
                    <div className='flex gap-2'>
                      {!isEditing ? (
                        <Button
                          size='sm'
                          variant='outline'
                          type='button'
                          onClick={() => onBeginEdit(note)}
                        >
                          <Pencil />
                          Edit
                        </Button>
                      ) : null}
                      <Button
                        size='sm'
                        variant='outline-destructive'
                        type='button'
                        onClick={() => onDeleteRequest(note)}
                        disabled={
                          isDeletingNote && notePendingDeleteId === note.id
                        }
                      >
                        <Trash2 />
                        Delete
                      </Button>
                    </div>
                  ) : null}
                </div>

                {isEditing ? (
                  <div className='mt-4 space-y-3'>
                    <Textarea
                      value={editedNoteContent}
                      onChange={(event) =>
                        onEditedNoteContentChange(event.target.value)
                      }
                      disabled={isUpdatingNote}
                    />
                    <label className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <Checkbox
                        checked={editedNoteInternal}
                        onCheckedChange={(checked) =>
                          onEditedNoteInternalChange(checked === true)
                        }
                        disabled={isUpdatingNote}
                      />
                      Internal note
                    </label>
                    <div className='flex flex-wrap gap-2'>
                      <Button
                        type='button'
                        size='sm'
                        onClick={onSaveNote}
                        disabled={isUpdatingNote || !editedNoteContent.trim()}
                      >
                        {isUpdatingNote ? <Spinner /> : null}
                        Save note
                      </Button>
                      <Button
                        type='button'
                        size='sm'
                        variant='outline'
                        onClick={onCancelEdit}
                        disabled={isUpdatingNote}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className='mt-4 whitespace-pre-wrap text-sm leading-6 text-foreground/90'>
                    {note.content}
                  </p>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};

export default TicketDetailsNotesSection;

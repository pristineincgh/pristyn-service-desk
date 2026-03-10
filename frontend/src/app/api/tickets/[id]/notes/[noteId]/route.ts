import { proxyApiRequest } from '@/app/api/proxy';
import { NextRequest } from 'next/server';

type TicketNoteRouteParams = {
  params: Promise<{
    id: string;
    noteId: string;
  }>;
};

export async function PATCH(
  request: NextRequest,
  { params }: TicketNoteRouteParams
) {
  const { id, noteId } = await params;

  return proxyApiRequest(request, {
    path: `/tickets/${encodeURIComponent(id)}/notes/${encodeURIComponent(noteId)}`,
    method: 'PATCH',
    parseRequestBody: true,
    serviceName: 'tickets service',
    parseResponseErrorMessage: 'Unable to parse ticket note update response',
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: TicketNoteRouteParams
) {
  const { id, noteId } = await params;

  return proxyApiRequest(request, {
    path: `/tickets/${encodeURIComponent(id)}/notes/${encodeURIComponent(noteId)}`,
    method: 'DELETE',
    serviceName: 'tickets service',
    parseResponseErrorMessage: 'Unable to parse ticket note deletion response',
  });
}

import { proxyApiRequest } from '@/app/api/proxy';
import { NextRequest } from 'next/server';

type TicketNotesRouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: NextRequest,
  { params }: TicketNotesRouteParams
) {
  const { id } = await params;

  return proxyApiRequest(request, {
    path: `/tickets/${encodeURIComponent(id)}/notes`,
    method: 'GET',
    serviceName: 'tickets service',
  });
}

export async function POST(
  request: NextRequest,
  { params }: TicketNotesRouteParams
) {
  const { id } = await params;

  return proxyApiRequest(request, {
    path: `/tickets/${encodeURIComponent(id)}/notes`,
    method: 'POST',
    parseRequestBody: true,
    serviceName: 'tickets service',
    parseResponseErrorMessage: 'Unable to parse ticket note creation response',
  });
}

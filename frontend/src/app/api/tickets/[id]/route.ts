import { NextRequest } from 'next/server';
import { proxyApiRequest } from '../../proxy';

type TicketRouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, { params }: TicketRouteParams) {
  const { id } = await params;

  return proxyApiRequest(request, {
    path: `/tickets/${encodeURIComponent(id)}`,
    method: 'GET',
    serviceName: 'tickets service',
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: TicketRouteParams
) {
  const { id } = await params;

  return proxyApiRequest(request, {
    path: `/tickets/${encodeURIComponent(id)}`,
    method: 'PATCH',
    parseRequestBody: true,
    serviceName: 'tickets service',
    parseResponseErrorMessage: 'Unable to parse ticket update response',
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: TicketRouteParams
) {
  const { id } = await params;

  return proxyApiRequest(request, {
    path: `/tickets/${encodeURIComponent(id)}`,
    method: 'DELETE',
    serviceName: 'tickets service',
    parseResponseErrorMessage: 'Unable to parse ticket deletion response',
  });
}

import { NextRequest } from 'next/server';
import { proxyApiRequest } from '../../proxy';

type TicketCategoryRouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: NextRequest,
  { params }: TicketCategoryRouteParams
) {
  const { id } = await params;

  return proxyApiRequest(request, {
    path: `/ticket-categories/${encodeURIComponent(id)}`,
    method: 'GET',
    serviceName: 'tickets service',
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: TicketCategoryRouteParams
) {
  const { id } = await params;

  return proxyApiRequest(request, {
    path: `/ticket-categories/${encodeURIComponent(id)}`,
    method: 'PATCH',
    parseRequestBody: true,
    serviceName: 'tickets service',
    parseResponseErrorMessage:
      'Unable to parse ticket category update response',
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: TicketCategoryRouteParams
) {
  const { id } = await params;

  return proxyApiRequest(request, {
    path: `/ticket-categories/${encodeURIComponent(id)}`,
    method: 'DELETE',
    serviceName: 'tickets service',
  });
}

import { NextRequest } from 'next/server';
import { proxyApiRequest } from '../../proxy';

type CustomerRouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: NextRequest,
  { params }: CustomerRouteParams
) {
  const { id } = await params;

  return proxyApiRequest(request, {
    path: `/customers/${encodeURIComponent(id)}`,
    method: 'GET',
    serviceName: 'customers service',
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: CustomerRouteParams
) {
  const { id } = await params;

  return proxyApiRequest(request, {
    path: `/customers/${encodeURIComponent(id)}`,
    method: 'PATCH',
    parseRequestBody: true,
    serviceName: 'customers service',
    parseResponseErrorMessage: 'Unable to parse customer update response',
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: CustomerRouteParams
) {
  const { id } = await params;

  return proxyApiRequest(request, {
    path: `/customers/${encodeURIComponent(id)}`,
    method: 'DELETE',
    serviceName: 'customers service',
  });
}

import { NextRequest } from 'next/server';
import { proxyApiRequest } from '../../../proxy';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return proxyApiRequest(request, {
    path: `/users/${encodeURIComponent(id)}/status`,
    method: 'PATCH',
    parseRequestBody: true,
    serviceName: 'users service',
  });
}

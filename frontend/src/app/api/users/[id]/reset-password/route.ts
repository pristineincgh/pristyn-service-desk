import { NextRequest } from 'next/server';
import { proxyApiRequest } from '../../../proxy';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return proxyApiRequest(request, {
    path: `/users/${encodeURIComponent(id)}/reset-password`,
    method: 'POST',
    serviceName: 'users service',
  });
}

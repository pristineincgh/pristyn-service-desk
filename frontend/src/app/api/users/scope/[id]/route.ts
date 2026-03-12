import { NextRequest } from 'next/server';
import { proxyApiRequest } from '../../../proxy';

type ScopeParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, { params }: ScopeParams) {
  const { id } = await params;

  return proxyApiRequest(request, {
    path: `/users/scope/${encodeURIComponent(id)}`,
    method: 'GET',
    serviceName: 'users service',
  });
}

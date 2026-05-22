import { NextRequest } from 'next/server';
import { proxyApiRequest } from '../../../proxy';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  return proxyApiRequest(request, {
    path: `/notifications/${encodeURIComponent(id)}/read`,
    method: 'PATCH',
    serviceName: 'notifications service',
  });
}

import { NextRequest } from 'next/server';
import { proxyApiRequest } from '../../../../proxy';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  return proxyApiRequest(request, {
    path: `/users/${encodeURIComponent(id)}/email-verification/resend`,
    method: 'POST',
    serviceName: 'users service',
  });
}

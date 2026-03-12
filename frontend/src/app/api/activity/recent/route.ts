import { NextRequest } from 'next/server';
import { proxyApiRequest } from '../../proxy';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const limit = searchParams.get('limit');

  return proxyApiRequest(request, {
    path: `/activity/recent${limit ? `?limit=${encodeURIComponent(limit)}` : ''}`,
    method: 'GET',
    serviceName: 'activity service',
  });
}

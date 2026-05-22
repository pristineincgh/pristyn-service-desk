import { NextRequest } from 'next/server';
import { proxyApiRequest } from '../proxy';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.toString();

  return proxyApiRequest(request, {
    path: `/notifications${query ? `?${query}` : ''}`,
    method: 'GET',
    serviceName: 'notifications service',
  });
}

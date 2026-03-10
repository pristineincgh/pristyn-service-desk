import { proxyApiRequest } from '../proxy';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.toString();
  const path = query ? `/tickets?${query}` : '/tickets';

  return proxyApiRequest(request, {
    path,
    method: 'GET',
    serviceName: 'tickets service',
  });
}

export async function POST(request: NextRequest) {
  return proxyApiRequest(request, {
    path: '/tickets/new-ticket',
    method: 'POST',
    parseRequestBody: true,
    serviceName: 'tickets service',
    parseResponseErrorMessage: 'Unable to parse ticket creation response',
  });
}

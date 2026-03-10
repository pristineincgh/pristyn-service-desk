import { NextRequest } from 'next/server';
import { proxyApiRequest } from '../proxy';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.toString();
  const path = query ? `/customers?${query}` : '/customers';

  return proxyApiRequest(request, {
    path,
    method: 'GET',
    serviceName: 'customers service',
  });
}

export async function POST(request: NextRequest) {
  return proxyApiRequest(request, {
    path: '/customers',
    method: 'POST',
    parseRequestBody: true,
    serviceName: 'customers service',
    parseResponseErrorMessage: 'Unable to parse customer creation response',
  });
}

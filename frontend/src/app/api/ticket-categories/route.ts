import { NextRequest } from 'next/server';
import { proxyApiRequest } from '../proxy';

export async function GET(request: NextRequest) {
  return proxyApiRequest(request, {
    path: '/ticket-categories',
    method: 'GET',
    serviceName: 'tickets service',
  });
}

export async function POST(request: NextRequest) {
  return proxyApiRequest(request, {
    path: '/ticket-categories',
    method: 'POST',
    parseRequestBody: true,
    serviceName: 'tickets service',
    parseResponseErrorMessage:
      'Unable to parse ticket category creation response',
  });
}

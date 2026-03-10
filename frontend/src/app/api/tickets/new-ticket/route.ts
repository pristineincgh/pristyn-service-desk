import { proxyApiRequest } from '../../proxy';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  return proxyApiRequest(request, {
    path: '/tickets/new-ticket',
    method: 'POST',
    parseRequestBody: true,
    serviceName: 'tickets service',
    parseResponseErrorMessage: 'Unable to parse ticket creation response',
  });
}

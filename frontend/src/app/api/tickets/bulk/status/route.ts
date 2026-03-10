import { NextRequest } from 'next/server';
import { proxyApiRequest } from '../../../proxy';

export async function PATCH(request: NextRequest) {
  return proxyApiRequest(request, {
    path: '/tickets/bulk/status',
    method: 'PATCH',
    parseRequestBody: true,
    serviceName: 'tickets service',
    parseResponseErrorMessage: 'Unable to parse bulk ticket status response',
  });
}

import { NextRequest } from 'next/server';
import { proxyApiRequest } from '../../proxy';

export async function DELETE(request: NextRequest) {
  return proxyApiRequest(request, {
    path: '/tickets/bulk',
    method: 'DELETE',
    parseRequestBody: true,
    serviceName: 'tickets service',
    parseResponseErrorMessage: 'Unable to parse bulk ticket deletion response',
  });
}

import { NextRequest } from 'next/server';
import { proxyApiRequest } from '../../proxy';

export async function PATCH(request: NextRequest) {
  return proxyApiRequest(request, {
    path: '/users/assign-supervisor',
    method: 'PATCH',
    parseRequestBody: true,
    serviceName: 'users service',
  });
}

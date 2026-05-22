import { NextRequest } from 'next/server';
import { proxyApiRequest } from '../../proxy';

export async function PATCH(request: NextRequest) {
  return proxyApiRequest(request, {
    path: '/notifications/read-all',
    method: 'PATCH',
    serviceName: 'notifications service',
  });
}

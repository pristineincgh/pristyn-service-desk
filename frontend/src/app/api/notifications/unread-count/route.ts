import { NextRequest } from 'next/server';
import { proxyApiRequest } from '../../proxy';

export async function GET(request: NextRequest) {
  return proxyApiRequest(request, {
    path: '/notifications/unread-count',
    method: 'GET',
    serviceName: 'notifications service',
  });
}

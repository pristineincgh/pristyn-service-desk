import { NextRequest } from 'next/server';
import { proxyApiRequest } from '../../proxy';

export async function POST(request: NextRequest) {
  return proxyApiRequest(request, {
    path: '/auth/logout',
    method: 'POST',
    serviceName: 'auth service',
  });
}

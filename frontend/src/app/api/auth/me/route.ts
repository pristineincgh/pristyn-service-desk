import { NextRequest } from 'next/server';
import { proxyApiRequest } from '../../proxy';

export async function GET(request: NextRequest) {
  return proxyApiRequest(request, {
    path: '/auth/me',
    method: 'GET',
    serviceName: 'auth service',
  });
}

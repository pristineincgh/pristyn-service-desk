import { NextRequest } from 'next/server';
import { proxyApiRequest } from '../../proxy';

export async function GET(request: NextRequest) {
  return proxyApiRequest(request, {
    path: '/users/inactive',
    method: 'GET',
    serviceName: 'users service',
  });
}

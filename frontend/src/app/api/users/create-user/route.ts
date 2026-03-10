import { NextRequest } from 'next/server';
import { proxyApiRequest } from '../../proxy';

export async function POST(request: NextRequest) {
  return proxyApiRequest(request, {
    path: '/users/create-user',
    method: 'POST',
    parseRequestBody: true,
    serviceName: 'users service',
  });
}

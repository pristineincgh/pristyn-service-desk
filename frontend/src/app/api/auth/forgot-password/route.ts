import { NextRequest } from 'next/server';
import { proxyApiRequest } from '../../proxy';

export async function POST(request: NextRequest) {
  return proxyApiRequest(request, {
    path: '/auth/forgot-password',
    method: 'POST',
    parseRequestBody: true,
    includeSessionCookie: false,
    serviceName: 'auth service',
    parseResponseErrorMessage: 'Unable to parse forgot password response',
  });
}

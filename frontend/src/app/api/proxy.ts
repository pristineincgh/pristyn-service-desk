import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL;

type ProxyMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

type ProxyApiOptions = {
  path: string;
  method?: ProxyMethod;
  body?: unknown;
  parseRequestBody?: boolean;
  includeSessionCookie?: boolean;
  serviceName?: string;
  parseResponseErrorMessage?: string;
};

export async function proxyApiRequest(
  request: NextRequest,
  options: ProxyApiOptions
) {
  if (!API_URL) {
    return NextResponse.json(
      { message: 'API_URL is not defined in environment variables' },
      { status: 500 }
    );
  }

  let requestBody = options.body;
  if (options.parseRequestBody) {
    try {
      requestBody = await request.json();
    } catch {
      return NextResponse.json(
        { message: 'Invalid JSON request body' },
        { status: 400 }
      );
    }
  }

  const headers: HeadersInit = {};
  if (options.includeSessionCookie !== false) {
    const sessionId = request.cookies.get('sessionId');
    if (sessionId) {
      headers.Cookie = `sessionId=${sessionId.value}`;
    }
  }

  if (requestBody !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(`${API_URL}${options.path}`, {
      method: options.method ?? 'GET',
      headers,
      cache: 'no-store',
      body: requestBody !== undefined ? JSON.stringify(requestBody) : undefined,
    });

    const data = await response.json().catch(() => ({
      message:
        options.parseResponseErrorMessage ?? 'Unable to parse upstream response',
    }));

    const nextResponse = NextResponse.json(data, {
      status: response.status,
    });

    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      nextResponse.headers.set('set-cookie', setCookie);
    }

    return nextResponse;
  } catch {
    return NextResponse.json(
      {
        message: `Unable to reach ${
          options.serviceName ?? 'upstream service'
        }`,
      },
      { status: 500 }
    );
  }
}

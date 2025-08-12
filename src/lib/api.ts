import { NextRequest } from 'next/server';

/**
 * apiFetch - universal fetch for dev/prod that prefixes API calls with the correct base URL
 *
 * Usage:
 *   apiFetch('/users', { method: 'GET' })
 *   apiFetch('https://external.com/endpoint') // untouched
 */export async function apiFetch(
  input: string | Request,
  init?: RequestInit,
): Promise<Response> {
  let url = input;

  if (typeof input === 'string') {
    url =
      process.env.NEXT_PUBLIC_API_URL +
      (input.startsWith('/') ? input : '/' + input);
  }

  // Jangan tambahkan header Authorization di sini

  return fetch(url as RequestInfo, init);
}

export function getClientIP(request: NextRequest): string {
  return (
    // request.headers.get('x-forwarded-for') ||
    // request.headers.get('x-real-ip') ||
    //|| request.socket.remoteAddress
    'unknown'
  );
}

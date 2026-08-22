import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types/api.types';
import { ZodError } from 'zod';

export function successResponse<T>(data: T, message?: string, meta?: ApiResponse['meta'], status = 200) {
  const body: ApiResponse<T> = {
    success: true,
    data,
    ...(message ? { message } : {}),
    ...(meta ? { meta } : {}),
  };
  return NextResponse.json(body, { status });
}

export function errorResponse(error: string | ZodError | Error | any, status = 400) {
  if (error instanceof ZodError) {
    const formattedError = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    return NextResponse.json(
      {
        success: false,
        error: `Validation Error: ${formattedError}`,
      },
      { status: 400 }
    );
  }

  const errorMessage = typeof error === 'string'
    ? error
    : (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
        ? error.message
        : JSON.stringify(error) || String(error));

  return NextResponse.json(
    {
      success: false,
      error: errorMessage,
    },
    { status }
  );
}


export function unauthorizedResponse(message = 'Unauthorized') {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 401 }
  );
}

export function notFoundResponse(message = 'Resource not found') {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status: 404 }
  );
}

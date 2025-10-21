import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://localhost:8001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters that match the service
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';
    const search = searchParams.get('search') || '';

    // Build query string with the parameters
    const queryParams = new URLSearchParams();
    if (limit !== '10') queryParams.set('limit', limit);
    if (offset !== '0') queryParams.set('offset', offset);
    if (search) queryParams.set('search', search);

    const queryString = queryParams.toString();
    const url = `${BACKEND_URL}/api/web/v1/products${
      queryString ? `?${queryString}` : ''
    }`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization') && {
          authorization: request.headers.get('authorization')!,
        }),
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          status_code: response.status.toString(),
          is_success: false,
          error_code: 'FETCH_PRODUCTS_FAILED',
          data: null,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      {
        status_code: '500',
        is_success: false,
        error_code: 'INTERNAL_SERVER_ERROR',
        data: null,
      },
      { status: 500 }
    );
  }
}

// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

const BACKEND_URL = process.env.BACKEND_URL;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // 1. Verify Firebase Token
    const authHeader = request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          status_code: '401',
          is_success: false,
          error_code: 'MISSING_TOKEN',
          data: 'Authorization token is required',
          pagination: null,
        },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];

    try {
      // Verify token using Firebase Admin
      const decodedToken = await adminAuth.verifyIdToken(token);
      console.log('Authenticated user:', decodedToken.email);
    } catch (firebaseError: any) {
      console.error('Firebase token verification failed:', firebaseError);

      return NextResponse.json(
        {
          status_code: '401',
          is_success: false,
          error_code: 'INVALID_TOKEN',
          data: 'Firebase ID token has expired/Invalid Token',
          pagination: null,
        },
        { status: 401 }
      );
    }

    // 2. Extract query parameters (sama seperti punya Anda)
    const limit = searchParams.get('limit') || '10';
    const offset = searchParams.get('offset') || '0';
    const search = searchParams.get('search') || '';

    // 3. Build query string with the parameters (sama seperti punya Anda)
    const queryParams = new URLSearchParams();
    if (limit !== '10') queryParams.set('limit', limit);
    if (offset !== '0') queryParams.set('offset', offset);
    if (search) queryParams.set('search', search);

    const queryString = queryParams.toString();
    const url = `${BACKEND_URL}/api/web/v1/products${
      queryString ? `?${queryString}` : ''
    }`;

    // 4. Forward request to backend (sama seperti punya Anda)
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization header
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
          pagination: null,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      {
        status_code: '500',
        is_success: false,
        error_code: 'INTERNAL_SERVER_ERROR',
        data: null,
        pagination: null,
      },
      { status: 500 }
    );
  }
}

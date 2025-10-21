import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = 'http://localhost:8001';

// GET /api/product - Get single product by ID
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');

    if (!productId) {
      return NextResponse.json(
        {
          status_code: '400',
          is_success: false,
          error_code: 'MISSING_PRODUCT_ID',
          data: null,
        },
        { status: 400 }
      );
    }

    const url = `${BACKEND_URL}/api/web/v1/product?product_id=${productId}`;

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
          error_code: 'PRODUCT_NOT_FOUND',
          data: null,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching product:', error);
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

// POST /api/product - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.product_title || !body.product_price) {
      return NextResponse.json(
        {
          status_code: '400',
          is_success: false,
          error_code: 'MISSING_REQUIRED_FIELDS',
          data: null,
        },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/web/v1/product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization') && {
          authorization: request.headers.get('authorization')!,
        }),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          status_code: response.status.toString(),
          is_success: false,
          error_code: 'CREATE_PRODUCT_FAILED',
          data: null,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating product:', error);
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

// PUT /api/product - Update product
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required product_id
    if (!body.product_id) {
      return NextResponse.json(
        {
          status_code: '400',
          is_success: false,
          error_code: 'MISSING_PRODUCT_ID',
          data: null,
        },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/web/v1/product`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization') && {
          authorization: request.headers.get('authorization')!,
        }),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          status_code: response.status.toString(),
          is_success: false,
          error_code: 'UPDATE_PRODUCT_FAILED',
          data: null,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating product:', error);
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

// DELETE /api/product - Delete product by ID
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');

    if (!productId) {
      return NextResponse.json(
        {
          status_code: '400',
          is_success: false,
          error_code: 'MISSING_PRODUCT_ID',
          data: null,
        },
        { status: 400 }
      );
    }

    const url = `${BACKEND_URL}/api/web/v1/product?product_id=${productId}`;

    const response = await fetch(url, {
      method: 'DELETE',
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
          error_code: 'DELETE_PRODUCT_FAILED',
          data: null,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting product:', error);
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

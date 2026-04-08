/**
 * AI 예측 상태 조회 API
 */

import { NextRequest, NextResponse } from 'next/server';

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN || '';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const predictionId = searchParams.get('id');

    if (!predictionId) {
      return NextResponse.json(
        { error: 'Prediction ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const apiToken = request.headers.get('x-replicate-token') || REPLICATE_API_TOKEN;

    if (!apiToken) {
      return NextResponse.json(
        { error: 'Replicate API 토큰이 없습니다.' },
        { status: 400 }
      );
    }

    // Replicate API에 요청
    const response = await fetch(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Token ${apiToken}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('[API] Replicate 상태 조회 에러:', error);

      return NextResponse.json(
        { error: error.detail || '상태 조회 실패' },
        { status: response.status }
      );
    }

    const prediction = await response.json();
    return NextResponse.json(prediction);
  } catch (error) {
    console.error('[API] 상태 조회 에러:', error);
    return NextResponse.json(
      { error: 'AI 상태 조회 중 오류 발생' },
      { status: 500 }
    );
  }
}

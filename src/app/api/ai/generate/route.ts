/**
 * AI 썸네일 생성 API
 * Replicate의 Stable Diffusion 3.5 Medium + img2img 사용
 * 도안 이미지를 입력으로 하여 실제 니트 사진처럼 변환
 */

import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

interface GenerateRequest {
  prompt: string;
  negative_prompt?: string;
  patternImage: string; // base64 encoded pattern image (필수!)
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();

    // 토큰 확인
    const apiToken = request.headers.get('x-replicate-token') || process.env.REPLICATE_API_TOKEN;

    if (!apiToken) {
      return NextResponse.json(
        { error: 'Replicate API 토큰이 필요합니다.' },
        { status: 400 }
      );
    }

    if (!body.patternImage) {
      return NextResponse.json(
        { error: '도안 이미지가 필요합니다.' },
        { status: 400 }
      );
    }

    console.log('[API] Stable Diffusion 3.5 Medium (img2img)로 생성 시작...');
    console.log('[API] 프롬프트:', body.prompt);
    console.log('[API] API 토큰:', apiToken ? '있음 (길이: ' + apiToken.length + ')' : '없음');

    // Replicate 클라이언트 초기화
    const replicate = new Replicate({
      auth: apiToken,
    });

    // Stable Diffusion 3.5 Medium으로 img2img 생성
    console.log('[API] replicate.run() 호출 중...');

    const output = await replicate.run(
      'stability-ai/stable-diffusion-3.5-medium',
      {
        input: {
          image: body.patternImage, // base64 도안 이미지
          prompt: body.prompt,
          negative_prompt: body.negative_prompt || 'blurry, low quality, deformed, ugly, cartoon, painting, sketch',
          strength: 0.8, // 도안 구조 유지하면서 스타일 개선 (0.7-0.9 추천)
          num_inference_steps: 30,
          guidance_scale: 7.5,
        },
      }
    );

    console.log('[API] 생성 완료. output 타입:', typeof output);
    console.log('[API] output:', JSON.stringify(output));

    // output 검증
    let imageUrl: string | null = null;

    // output이 배열인 경우
    if (Array.isArray(output) && output.length > 0) {
      imageUrl = typeof output[0] === 'string' ? output[0] : output[0]?.toString();
      console.log('[API] 배열 형식 - imageUrl:', imageUrl);
    }
    // output이 직접 문자열인 경우
    else if (typeof output === 'string') {
      imageUrl = output;
      console.log('[API] 문자열 형식 - imageUrl:', imageUrl);
    }
    // output이 객체인 경우 (Blob 또는 Replicate 응답 객체)
    else if (typeof output === 'object' && output !== null) {
      const anyOutput = output as any;

      // Replicate File 객체의 경우 - .url() 메서드 호출
      if (typeof anyOutput.url === 'function') {
        console.log('[API] URL이 함수입니다. 호출 중...');
        imageUrl = await anyOutput.url();
        console.log('[API] 함수 호출 결과:', imageUrl);
      }
      // .url 프로퍼티가 직접 문자열인 경우
      else if (typeof anyOutput.url === 'string') {
        imageUrl = anyOutput.url;
        console.log('[API] .url 프로퍼티:', imageUrl);
      }
      // 첫 번째 요소가 URL인 경우
      else if (anyOutput[0]) {
        imageUrl = typeof anyOutput[0] === 'string' ? anyOutput[0] : anyOutput[0]?.toString();
        console.log('[API] 첫 번째 요소:', imageUrl);
      }
      else {
        console.log('[API] output 상세:', Object.keys(anyOutput), anyOutput);
      }
    }

    if (!imageUrl) {
      console.error('[API] 이미지 URL을 찾을 수 없음. output:', output);
      return NextResponse.json(
        { error: 'AI 생성에 실패했습니다. 결과를 파싱할 수 없습니다.' },
        { status: 500 }
      );
    }

    console.log('[API] 최종 이미지 URL:', imageUrl);

    // 성공
    return NextResponse.json({
      id: `sd-${Date.now()}`,
      status: 'succeeded',
      output: [imageUrl],
    });
  } catch (error: any) {
    console.error('[API] 에러:', error);

    // 토큰 에러
    if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Replicate API 토큰이 유효하지 않습니다.' },
        { status: 401 }
      );
    }

    // Rate limit 에러
    if (error.message?.includes('429') || error.message?.includes('rate limit')) {
      return NextResponse.json(
        { error: 'API 호출 제한을 초과했습니다. 잠시 후 다시 시도해주세요.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'AI 썸네일 생성 중 오류 발생' },
      { status: 500 }
    );
  }
}

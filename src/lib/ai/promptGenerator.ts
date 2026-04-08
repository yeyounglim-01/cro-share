/**
 * 니트 도안을 자연어 프롬프트로 변환
 */

import { KnitChartData, YarnColor } from '@/types/knit';

interface PromptOptions {
  style?: 'realistic' | 'artistic';
  lighting?: 'natural' | 'studio' | 'warm';
  background?: 'white' | 'fabric' | 'wooden';
}

/**
 * 색상 팔레트를 영어로 설명
 */
function colorPaletteToDescription(yarnPalette: YarnColor[]): string {
  if (yarnPalette.length === 0) {
    return 'neutral tones';
  }

  const labels = yarnPalette.map(y => y.labelEn || y.label);

  if (labels.length === 1) {
    return labels[0];
  }

  if (labels.length === 2) {
    return `${labels[0]} and ${labels[1]}`;
  }

  return labels.slice(0, -1).join(', ') + `, and ${labels[labels.length - 1]}`;
}

/**
 * 도안 이름으로부터 패턴 특성 추론
 */
function inferPatternCharacteristics(name: string): {
  type: string;
  description: string;
} {
  const lowerName = name.toLowerCase();

  // 패턴 유형 감지
  if (
    lowerName.includes('heart') ||
    lowerName.includes('하트') ||
    lowerName.includes('♥')
  ) {
    return {
      type: 'heart',
      description: 'a beautiful knitted heart motif',
    };
  }

  if (lowerName.includes('star') || lowerName.includes('별')) {
    return {
      type: 'star',
      description: 'geometric star patterns',
    };
  }

  if (lowerName.includes('geometric') || lowerName.includes('기하')) {
    return {
      type: 'geometric',
      description: 'geometric interlocking patterns',
    };
  }

  if (lowerName.includes('animal') || lowerName.includes('동물')) {
    return {
      type: 'animal',
      description: 'adorable animal motifs',
    };
  }

  if (lowerName.includes('flower') || lowerName.includes('꽃')) {
    return {
      type: 'floral',
      description: 'delicate floral patterns',
    };
  }

  // 기본값: 도안 크기로 추론
  if (name.length > 15) {
    return {
      type: 'complex',
      description: 'intricate knit patterns',
    };
  }

  return {
    type: 'simple',
    description: 'a minimalist knit pattern',
  };
}

/**
 * 도안 크기로부터 난이도/상세도 추론
 */
function inferComplexity(width: number, height: number): string {
  const cellCount = width * height;

  if (cellCount < 100) {
    return 'simple, minimalist';
  }

  if (cellCount < 500) {
    return 'moderate complexity with nice details';
  }

  if (cellCount < 1000) {
    return 'complex with intricate details';
  }

  return 'highly detailed and intricate';
}

/**
 * 메인 프롬프트 생성 함수
 * img2img 스타일 변환용: 도안 → 실제 니트 사진
 */
export function generatePrompt(
  chartData: KnitChartData,
  options: PromptOptions = {}
): string {
  const colorDescription = colorPaletteToDescription(chartData.yarnPalette);
  const { description: patternDesc } = inferPatternCharacteristics(chartData.name);

  // img2img는 구조는 유지하고 스타일만 개선하므로 간결함
  const prompt = `A cozy, realistic close-up of a colorwork knitting project in progress.
The knitted fabric displays the ${patternDesc} pattern in beautiful ${colorDescription} colors.
Soft, chunky yarn texture with visible knit stitches, purl bumps, and weave patterns.
Two wooden bamboo knitting needles inserted into the top of the swatch.
Warm, golden hour side lighting creating soft shadows and highlights.
Shallow depth of field with bokeh background, cinematic photography style.
Professional product photography, high resolution, sharp focus, studio quality.
Cozy, inviting, handmade aesthetic. No text overlays.`;

  return prompt.replace(/\s+/g, ' ').trim();
}

/**
 * 부정 프롬프트 (공통으로 피해야 할 것)
 */
export function getNegativePrompt(): string {
  return [
    'blurry',
    'low quality',
    'deformed',
    'ugly',
    'pixelated',
    'cartoon',
    'drawing',
    'sketch',
    'watercolor',
    'distorted stitches',
    'uneven color',
    'flat appearance',
    'digital pattern',
  ].join(', ');
}

/**
 * 도안 메타데이터 기반 추천 파라미터
 */
export function getOptimalParameters(chartData: KnitChartData): {
  conditioning_scale: number;
  guidance_scale: number;
  num_inference_steps: number;
} {
  const cellCount = chartData.width * chartData.height;

  // 도안 복잡도에 따른 파라미터 조정
  if (cellCount < 100) {
    // 간단한 도안: 더 높은 가이던스로 패턴 강조
    return {
      conditioning_scale: 0.85, // 도안 구조 더 강하게 유지
      guidance_scale: 8.5, // 프롬프트 더 충실하게
      num_inference_steps: 30,
    };
  }

  if (cellCount < 500) {
    return {
      conditioning_scale: 0.8,
      guidance_scale: 7.5,
      num_inference_steps: 28,
    };
  }

  // 복잡한 도안: 더 낮은 가이던스로 자연스러운 결과
  return {
    conditioning_scale: 0.75,
    guidance_scale: 7.0,
    num_inference_steps: 25,
  };
}

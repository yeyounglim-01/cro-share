/**
 * Replicate API 클라이언트
 * Stable Diffusion XL + ControlNet을 통한 AI 스와치 생성
 */

export interface ReplicateInput {
  prompt: string;
  negative_prompt?: string;
  control_image: string; // base64-encoded image
  conditioning_scale: number; // 0.0-1.0, default 0.8
  guidance_scale: number; // 3.0-15.0, default 7.5
  num_inference_steps: number; // 1-50, default 25
  width?: number;
  height?: number;
  seed?: number;
}

export interface PredictionResponse {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  input: ReplicateInput;
  output?: string[]; // URL array on success
  error?: string;
  logs?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  urls: {
    get: string;
    cancel: string;
  };
}

export class ReplicateError extends Error {
  constructor(
    public code: 'INVALID_TOKEN' | 'RATE_LIMITED' | 'GENERATION_FAILED' | 'NETWORK_ERROR' | 'TIMEOUT' | 'UNKNOWN',
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ReplicateError';
  }
}

export class ReplicateClient {
  // SDXL + ControlNet (canny edge detection)
  private readonly MODEL_VERSION = '4e54a4bdd0001c3f07eafc92df6541c3be369dbf4c4f3585b09300fda97916a9';
  private readonly API_BASE = 'https://api.replicate.com/v1';
  private readonly POLLING_INTERVAL = 500; // ms
  private readonly MAX_WAIT_TIME = 300000; // 5 minutes

  constructor(private apiToken: string) {
    if (!apiToken || !apiToken.trim()) {
      throw new ReplicateError('INVALID_TOKEN', 'API 토큰이 제공되지 않았습니다.');
    }
  }

  /**
   * 새 prediction 생성
   */
  async createPrediction(input: ReplicateInput): Promise<PredictionResponse> {
    try {
      const response = await fetch(`${this.API_BASE}/predictions`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: this.MODEL_VERSION,
          input: {
            prompt: input.prompt,
            negative_prompt: input.negative_prompt || 'blurry, low quality, deformed, ugly',
            image: input.control_image,
            conditioning_scale: input.conditioning_scale ?? 0.8,
            guidance_scale: input.guidance_scale ?? 7.5,
            num_inference_steps: input.num_inference_steps ?? 25,
            width: input.width ?? 512,
            height: input.height ?? 512,
            seed: input.seed,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();

        if (response.status === 401) {
          throw new ReplicateError(
            'INVALID_TOKEN',
            'Replicate API 토큰이 유효하지 않습니다.',
            error
          );
        } else if (response.status === 429) {
          throw new ReplicateError(
            'RATE_LIMITED',
            'API 호출 제한을 초과했습니다. 잠시 후 다시 시도해주세요.',
            error
          );
        }

        throw new ReplicateError(
          'GENERATION_FAILED',
          `API 오류: ${error.detail || response.statusText}`,
          error
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof ReplicateError) throw error;

      if (error instanceof TypeError) {
        throw new ReplicateError(
          'NETWORK_ERROR',
          '네트워크 연결 오류. 인터넷 연결을 확인해주세요.',
          error
        );
      }

      throw new ReplicateError(
        'UNKNOWN',
        'Replicate API 호출 중 오류 발생',
        error
      );
    }
  }

  /**
   * Prediction 상태 조회
   */
  async getPrediction(id: string): Promise<PredictionResponse> {
    try {
      const response = await fetch(`${this.API_BASE}/predictions/${id}`, {
        headers: {
          'Authorization': `Token ${this.apiToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new ReplicateError(
            'INVALID_TOKEN',
            'Replicate API 토큰이 유효하지 않습니다.'
          );
        }

        throw new ReplicateError(
          'NETWORK_ERROR',
          `상태 조회 실패: ${response.statusText}`
        );
      }

      return response.json();
    } catch (error) {
      if (error instanceof ReplicateError) throw error;

      throw new ReplicateError(
        'NETWORK_ERROR',
        'Prediction 상태 조회 중 오류 발생',
        error
      );
    }
  }

  /**
   * Prediction 취소
   */
  async cancelPrediction(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE}/predictions/${id}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiToken}`,
        },
      });

      if (!response.ok && response.status !== 404) {
        throw new ReplicateError(
          'NETWORK_ERROR',
          `Prediction 취소 실패: ${response.statusText}`
        );
      }
    } catch (error) {
      if (error instanceof ReplicateError) throw error;
      // 취소 실패는 무시 (이미 완료된 경우)
    }
  }

  /**
   * Prediction 완료 대기 (polling with exponential backoff)
   */
  async waitForCompletion(
    id: string,
    onProgress?: (prediction: PredictionResponse) => void
  ): Promise<string> {
    let waitTime = this.POLLING_INTERVAL;
    let elapsedTime = 0;

    while (elapsedTime < this.MAX_WAIT_TIME) {
      const prediction = await this.getPrediction(id);

      onProgress?.(prediction);

      if (prediction.status === 'succeeded') {
        if (!prediction.output || prediction.output.length === 0) {
          throw new ReplicateError(
            'GENERATION_FAILED',
            'AI 스와치 생성에 실패했습니다. 프롬프트를 확인해주세요.'
          );
        }
        return prediction.output[0]; // 첫 번째 이미지 반환
      }

      if (prediction.status === 'failed') {
        throw new ReplicateError(
          'GENERATION_FAILED',
          prediction.error || 'AI 스와치 생성에 실패했습니다.',
          prediction
        );
      }

      if (prediction.status === 'canceled') {
        throw new ReplicateError(
          'GENERATION_FAILED',
          '사용자가 생성을 취소했습니다.'
        );
      }

      // Exponential backoff: max 3초까지
      await new Promise(resolve => setTimeout(resolve, waitTime));
      waitTime = Math.min(waitTime * 1.2, 3000);
      elapsedTime += waitTime;
    }

    // 취소 시도
    await this.cancelPrediction(id);

    throw new ReplicateError(
      'TIMEOUT',
      'AI 스와치 생성 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.'
    );
  }

  /**
   * 전체 플로우: 생성 → 대기 → 결과
   */
  async generateThumbnail(
    input: ReplicateInput,
    onProgress?: (prediction: PredictionResponse) => void
  ): Promise<string> {
    const prediction = await this.createPrediction(input);
    return this.waitForCompletion(prediction.id, onProgress);
  }
}

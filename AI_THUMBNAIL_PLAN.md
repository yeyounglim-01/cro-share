# AI 썸네일 시뮬레이션 기능 구현 계획

**목표:** 니트 도안을 기반으로 실제 스와치처럼 보이는 AI 생성 썸네일 제공

**작성일:** 2026-04-08  
**상태:** 🔄 구현 중

---

## 문제 정의

현재 Cro-share의 도안 썸네일은 **도안 패턴이 적나라하게 보여서** 사용자 UX가 좋지 않음.

**예시:** 하트 도안의 현재 썸네일 (격자+기호) → 원하는 결과 (실제 니트 스와치 시뮬레이션)

---

## 솔루션 아키텍처

### 기술 스택 선택

| 항목 | 선택 | 이유 |
|------|------|------|
| **AI 플랫폼** | Replicate | ControlNet 지원, 클라이언트 호출 가능, 비용 효율적 ($0.01~0.05/img) |
| **모델** | Stable Diffusion XL + ControlNet | 정확한 도안 구조 유지 |
| **통합 방식** | 클라이언트 사이드 (React 컴포넌트) | FastAPI 백엔드 불필요 |
| **캐싱** | localStorage + IndexedDB | 재생성 방지, 빠른 로딩 |

### 데이터 플로우

```
도안 (ChartCell[][])
  ↓ [formatChartForPrompt]
"A handmade knitted cream and dusty rose heart pattern...
 Detailed knit texture with visible yarn loops, 
 soft natural lighting, professional product photography"
  ↓ [generateControlNetMask]
도안 기반 마스크 (정규화된 512×512 이미지)
  ↓ [Replicate API - txt2img-controlnet]
  POST /v1/predictions
  {
    version: "<SDXL+ControlNet model>",
    input: {
      prompt: "...",
      control_image: "<base64 마스크>",
      conditioning_scale: 0.8,  // ControlNet 강도
      guidance_scale: 7.5,
      num_inference_steps: 25
    }
  }
  ↓ [완료 대기 (polling)]
  ID: pred_xxxxx → status: succeeded
  ↓ [이미지 저장]
localStorage['thumbnails'][chartId] = imageUrl
  ↓ [UI 표시]
갤러리 카드 / 에디터 미리보기
```

---

## 구현 단계

### Phase 1: 코어 라이브러리 (Week 1)

#### 1.1 `src/lib/ai/replicateClient.ts`
```typescript
interface ReplicateInput {
  prompt: string;
  control_image: string;  // base64
  conditioning_scale: number;
  guidance_scale: number;
  num_inference_steps: number;
}

interface PredictionResponse {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed';
  output?: string[];  // 성공 시 이미지 URL 배열
  error?: string;
}

export class ReplicateClient {
  private apiToken: string;
  
  constructor(apiToken: string) {}
  
  async createPrediction(input: ReplicateInput): Promise<string> {
    // POST /v1/predictions
    // return prediction.id
  }
  
  async getPrediction(id: string): Promise<PredictionResponse> {
    // GET /v1/predictions/{id}
  }
  
  async waitForCompletion(id: string, maxWait: number = 60000): Promise<string> {
    // polling with exponential backoff
    // return image URL or throw error
  }
}
```

#### 1.2 `src/lib/ai/promptGenerator.ts`
```typescript
export function generatePrompt(
  chartData: KnitChartData,
  yarnColors: { color: string; label: string }[]
): string {
  // 도안 메타데이터 → 자연어 프롬프트
  // - 크기 (작음/중간/큼)
  // - 색상 조합 (컬러웍/단색)
  // - 패턴 특성 (기하도형/동물/자연)
  
  return `A beautiful handmade knitted ${description}...`;
}
```

#### 1.3 `src/lib/ai/controlNetMask.ts`
```typescript
export async function generateControlNetMask(
  chartData: KnitChartData,
  yarnColors: { color: string; label: string }[]
): Promise<string> {
  // chartData.cells[][] → Canvas 렌더링
  // - 각 stitch → 해당 색상 픽셀
  // - 512×512로 정규화
  // return base64 encoded PNG
}
```

### Phase 2: UI 통합 (Week 2)

#### 2.1 `src/components/ai/ThumbnailSimulator.tsx`
- "AI 스와치 생성" 버튼
- Replicate API 토큰 입력 모달 (처음 1회)
- 로딩 상태 (+ 진행률)
- 결과 이미지 표시
- 에러 처리 UI

#### 2.2 갤러리 카드 통합
- `PatternCard.tsx`에 AI 썸네일 표시 옵션
- 폴백: AI 생성 실패 시 기존 도안 표시

#### 2.3 에디터 미리보기
- 에디터에서 "AI 시뮬레이션 보기" 버튼
- 실시간 미리보기 (선택사항)

### Phase 3: 최적화 및 에러 처리 (Week 3)

#### 3.1 캐싱 전략
- `localStorage['ai_thumbnails'][chartId]` → 이미지 URL
- 도안 수정 시 캐시 무효화
- 용량 관리 (최대 50MB)

#### 3.2 에러 처리
```typescript
enum ThumbnailError {
  INVALID_TOKEN,           // API 토큰 잘못됨
  RATE_LIMITED,            // API 할당량 초과
  GENERATION_FAILED,       // ControlNet 실패
  NETWORK_ERROR,           // 네트워크 오류
  TIMEOUT,                 // 생성 시간 초과
}
```

#### 3.3 사용자 경험
- 생성 예상 시간 표시 (15~30초)
- 취소 버튼 (진행 중 Prediction 삭제)
- 히스토리 관리 (최근 생성 이미지 보기)

---

## Replicate API 상세

### 모델 선택

**권장:** `stability-ai/sdxl-controlnet-canny`

```
Model: stability-ai/sdxl-controlnet-canny
Version: 4e54a4bdd0001c3f07eafc92df6541c3be369dbf4c4f3585b09300fda97916a9

Input:
- prompt (str): 프롬프트
- control_image (str): base64 또는 URL
- conditioning_scale (float): 0.0~1.0 (기본값 0.8)
  - 낮을수록 원래 이미지 특성 유지
  - 높을수록 도안 구조 더 정확함
- guidance_scale (float): 3.0~15.0 (기본값 7.5)
  - 프롬프트 충실도 제어
- num_inference_steps (int): 10~50 (기본값 25)
  - 더 많을수록 품질 높음, 시간 오래 걸림

Output:
- Array[str]: 이미지 URL 배열
```

### 비용 계산

- 1 이미지 생성: ~$0.02 (SDXL + ControlNet)
- 1000 이미지: ~$20
- 가정: 월 500 활성 사용자 × 2회 = 1000 이미지/월 → $20/월

---

## 프롬프트 엔지니어링

### 기본 템플릿

```
[형용사] handmade knitted [패턴] pattern in [색상] colors.
[상세 설명]
Detailed knit texture with visible yarn loops and stitches.
Professional product photography, soft natural lighting.
High quality, fine details.
Negative prompt: blurry, low quality, deformed
```

### 색상 설정

```typescript
function colorToDescription(yarnPalette: YarnColor[]): string {
  if (palette.length === 1) return palette[0].label; // "cream"
  
  // 다중 색상
  const names = palette.map(y => y.label);
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return names.join(", "); // "cream, rose, and sage"
}
```

### 패턴 설명

```typescript
function getPatternDescription(chartData: KnitChartData): string {
  // chartData.name 분석
  if (name.includes("heart")) return "heart pattern";
  if (name.includes("geometric")) return "geometric pattern";
  if (name.includes("animal")) return "cute animal pattern";
  
  // 기본값: 도안 크기로 추론
  if (width > height) return "landscape pattern";
  return "vertical pattern";
}
```

---

## 테스트 계획

### Unit Tests
- `promptGenerator()` → 다양한 도안에서 적절한 프롬프트 생성?
- `generateControlNetMask()` → 유효한 base64 PNG 반환?

### Integration Tests
- Replicate API 모의 응답으로 전체 플로우 테스트
- 네트워크 에러 시뮬레이션 → 재시도 로직 동작?

### 사용자 테스트
- 실제 하트 도안 → AI 스와치 시뮬레이션 생성
- 시각 품질 평가

---

## 보안 고려사항

- ✅ Replicate API 토큰은 클라이언트에서 직접 사용
  - localStorage 저장 시 HTTPS 필수
  - 사용자에게 "공개하지 마세요" 경고
  
- ✅ 프롬프트 인젝션 방지
  - 사용자 입력 없음 (자동 생성만)
  - 예약어 필터링 (이중 인용문 제거 등)

- ✅ 생성된 이미지 저장소
  - localStorage (사용자 로컬)
  - 개인정보 문제 없음

---

## 향후 확장 (선택사항)

1. **모델 선택지 제공**
  - "realistic" vs "stylized" 옵션
  - Replicate의 다양한 모델 지원

2. **배경 맞춤형**
  - "yarn ball 배경" / "헝겊 배경" 선택

3. **AI 도안 생성 (역방향)**
  - 스와치 사진 → 도안 변환
  - Claude Vision 또는 별도 모델 사용

4. **소셜 공유**
  - 도안 + AI 스와치 함께 공유
  - Pinterest 통합

---

## 일정 및 마일스톤

- **Week 1 (4/8~4/14):** 코어 라이브러리 구현 + 테스트
- **Week 2 (4/15~4/21):** UI 통합 + 갤러리/에디터 연결
- **Week 3 (4/22~4/28):** 최적화, 에러 처리, 배포
- **4/29:** 메인 브랜치 병합 + 릴리스

---

## 리뷰 체크리스트

- [ ] Replicate API 토큰 관리 흐름
- [ ] 프롬프트 품질 (다양한 도안에서 테스트)
- [ ] UI/UX 자연스러운가?
- [ ] 에러 처리 모든 케이스 커버?
- [ ] 성능 (생성 시간, 캐싱)
- [ ] 보안 (토큰 노출 방지)

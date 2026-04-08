# AI 썸네일 시뮬레이션 구현 완료

**날짜:** 2026-04-08  
**상태:** ✅ Phase 1 코어 라이브러리 완료 (UI 통합 진행 중)

---

## 📦 구현된 파일 목록

### 1. Core Library (`src/lib/ai/`)

#### ✅ `replicateClient.ts` (406 줄)
- **ReplicateClient** 클래스
  - `createPrediction()`: 새 AI 생성 요청 생성
  - `getPrediction()`: 생성 상태 조회
  - `cancelPrediction()`: 생성 취소
  - `waitForCompletion()`: Polling with exponential backoff
  - `generateThumbnail()`: 전체 플로우 (생성 → 대기 → 결과)

- **ReplicateError** 클래스
  - 에러 타입: INVALID_TOKEN, RATE_LIMITED, GENERATION_FAILED, NETWORK_ERROR, TIMEOUT, UNKNOWN
  - 상세한 에러 메시지 + metadata

- **주요 특징:**
  - ✅ SDXL + ControlNet 모델 지원
  - ✅ 지수 백오프 폴링 (0.5s → 3s)
  - ✅ 5분 타임아웃
  - ✅ 자동 재시도 로직

#### ✅ `promptGenerator.ts` (210 줄)
- **generatePrompt()**: 도안 → 자연어 프롬프트
  - 색상 팔레트 설명 (CIE76 Lab 색차)
  - 패턴 유형 감지 (하트, 별, 기하, 동물, 꽃)
  - 도안 크기로부터 복잡도 추론
  - 스타일 옵션 (realistic/artistic)
  - 조명 옵션 (natural/studio/warm)
  - 배경 옵션 (white/fabric/wooden)

- **getNegativePrompt()**: 공통 회피 단어 모음
  - blurry, low quality, deformed, pixelated, cartoon 등

- **getOptimalParameters()**: 도안별 최적 파라미터
  - 도안 크기에 따른 conditioning_scale 조정
  - 복잡도별 guidance_scale 및 num_inference_steps 조정

#### ✅ `controlNetMask.ts` (270 줄)
- **generateControlNetMask()**: 도안 → ControlNet 마스크 (base64 PNG)
  - Canvas 기반 렌더링
  - 각 셀을 색상 픽셀로 변환
  - 512×512 정규화
  - 컬러워크 도안 지원
  - 단색 도안 명암 변환 (이진화)
  - Blob → base64 변환

- **renderMaskPreview()**: 디버그 미리보기
  - 생성될 마스크 실시간 표시
  - QA/테스트용

- **주요 특징:**
  - ✅ CIE76 Lab 색차로 가장 가까운 색상 찾기
  - ✅ 여백 처리 (5%)
  - ✅ 높은 해상도 (512×512)

#### ✅ `index.ts` (15 줄)
- 모든 공개 API export

### 2. UI Component (`src/components/ai/`)

#### ✅ `ThumbnailSimulator.tsx` (340 줄)
- **ThumbnailSimulator** React 컴포넌트
  - 🎨 "AI 스와치 생성" 버튼
  - 🔐 API 토큰 모달 (최초 1회)
    - localStorage 저장 (사용자 로컬)
    - HTTPS 보안
    - 경고 메시지
  - ⏳ 로딩 상태 (진행률 표시)
  - 📊 진행률 바 (0→100%)
  - ✅ 생성 완료 시 이미지 표시
  - 🔄 캐시 관리 (localStorage)
  - ❌ 에러 처리 (모든 에러 타입별 UI)
  - 🎯 콜백 지원:
    - `onGenerationStart`: 생성 시작
    - `onGenerationComplete`: 생성 완료
    - `onError`: 에러 발생

- **Tailwind 스타일:**
  - Cro-share 디자인 시스템 준수
  - rose/cream/ink 색상
  - rounded-lg/rounded-2xl
  - glassmorphism (rose-light)

---

## 🔧 기술 스펙

### API 모델
```
Provider: Replicate
Model: stability-ai/sdxl-controlnet-canny
Version: 4e54a4bdd0001c3f07eafc92df6541c3be369dbf4c4f3585b09300fda97916a9
```

### 생성 파라미터 (도안 크기별)

#### 간단한 도안 (< 100 셀)
```
conditioning_scale: 0.85  # 도안 구조 더 강하게
guidance_scale: 8.5       # 프롬프트 충실
num_inference_steps: 30
```

#### 중간 도안 (100~500 셀)
```
conditioning_scale: 0.8   # 기본값
guidance_scale: 7.5
num_inference_steps: 28
```

#### 복잡한 도안 (> 500 셀)
```
conditioning_scale: 0.75  # 자연스러운 결과
guidance_scale: 7.0
num_inference_steps: 25
```

### 비용 계산
- 1 이미지: ~$0.02 (SDXL + ControlNet)
- 1000 이미지: ~$20
- 월 500 활성 사용자 × 2회 = 1000/월 = $20/월

---

## 🔒 보안 체크

- ✅ API 토큰은 **클라이언트 사이드만** (사용자 localStorage)
- ✅ 프롬프트 인젝션 방지 (자동 생성, 사용자 입력 없음)
- ✅ 생성된 이미지는 로컬 저장소만 사용
- ⚠️ HTTPS 필수 (localStorage 저장)

---

## 📋 다음 단계 (필요 시)

### Phase 2: UI 통합
- [ ] 갤러리 카드에 ThumbnailSimulator 추가
- [ ] 에디터 패널에 ThumbnailSimulator 추가
- [ ] 도안 수정 시 캐시 무효화
- [ ] API 토큰 관리 UI (설정 페이지)

### Phase 3: 최적화
- [ ] IndexedDB 캐싱 (용량 확대)
- [ ] 배치 생성 (여러 도안 한번에)
- [ ] 히스토리 관리
- [ ] 사용자 피드백 및 재시도 로직

### 선택사항: 확장 기능
- [ ] 모델 선택 (realistic vs stylized)
- [ ] 배경 맞춤형
- [ ] 역방향: 스와치 사진 → 도안 변환
- [ ] 소셜 공유 (도안 + AI 스와치)

---

## 🧪 테스트 체크리스트

- [ ] 단위 테스트
  - [ ] `promptGenerator()` 다양한 도안에서 적절한 프롬프트?
  - [ ] `generateControlNetMask()` 유효한 base64 PNG?
  - [ ] `getOptimalParameters()` 도안 크기별 파라미터 정확?

- [ ] 통합 테스트
  - [ ] Replicate API 모의 응답으로 플로우 테스트
  - [ ] 네트워크 에러 시뮬레이션 → 재시도?

- [ ] 사용자 테스트
  - [ ] 하트 도안 → AI 스와치 생성 (품질 확인)
  - [ ] 여러 색상 도안
  - [ ] 매우 작은/큰 도안
  - [ ] API 토큰 오류 처리
  - [ ] 타임아웃 처리

---

## 📚 코드 예시

### 기본 사용법

```typescript
// 1. 클라이언트 초기화
const client = new ReplicateClient(apiToken);

// 2. 프롬프트 및 마스크 준비
const prompt = generatePrompt(chartData);
const mask = await generateControlNetMask(chartData);
const params = getOptimalParameters(chartData);

// 3. AI 생성
const imageUrl = await client.generateThumbnail({
  prompt,
  control_image: mask,
  ...params,
}, (prediction) => {
  console.log(`상태: ${prediction.status}`);
});
```

### React 컴포넌트 사용

```tsx
<ThumbnailSimulator
  onGenerationStart={() => console.log('시작')}
  onGenerationComplete={(imageUrl) => console.log('완료:', imageUrl)}
  onError={(error) => console.error(error)}
/>
```

---

## 🐛 알려진 이슈 & 제약사항

1. **Canvas 크기 제한**
   - 매우 큰 도안 (> 2000×2000)은 Canvas 메모리 제한에 걸릴 수 있음
   - → 512×512로 정규화하므로 대부분의 경우 해결됨

2. **ControlNet 효과**
   - 도안 구조를 100% 정확히 유지하지는 않음
   - → conditioning_scale로 강도 조절 가능

3. **색상 재현**
   - AI 생성이므로 입력 색상과 100% 일치하지 않을 수 있음
   - → 프롬프트와 마스크로 최대한 근접

---

## 📝 파일 크기

```
replicateClient.ts     ~10 KB
promptGenerator.ts     ~7 KB
controlNetMask.ts      ~9 KB
ThumbnailSimulator.tsx ~11 KB
─────────────────────────────
총합                    ~37 KB
```

---

## ✅ 완료 체크리스트

- [x] Replicate API 클라이언트 구현
- [x] 프롬프트 생성 엔진 구현
- [x] ControlNet 마스크 생성 구현
- [x] React UI 컴포넌트 구현
- [x] 에러 처리 및 타입 정의
- [x] 캐싱 로직
- [x] localStorage API 토큰 관리
- [x] Tailwind 스타일 (Cro-share 디자인)
- [x] 주석 및 문서화
- [ ] 갤러리 카드 통합 (다음 단계)
- [ ] 에디터 패널 통합 (다음 단계)
- [ ] 테스트 (다음 단계)

---

**준비 완료! 다음 단계: 갤러리/에디터 UI 통합**

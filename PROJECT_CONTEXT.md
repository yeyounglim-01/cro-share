# Cro-share 프로젝트 컨텍스트

> 이 파일을 읽으면 프로젝트 전체 상황을 파악할 수 있습니다.

---

## 프로젝트 개요

- **이름**: Cro-share
- **위치**: `C:\Users\user\knit-chart-generator`
- **GitHub**: https://github.com/yeyounglim-01/cro-share
- **설명**: 이미지를 업로드하거나 직접 그려서 대바늘/코바늘 뜨개질 도안을 만드는 Next.js 웹앱

---

## 기술 스택

| 항목 | 내용 |
|------|------|
| 프레임워크 | Next.js 16.2 (App Router, Turbopack) |
| 언어 | TypeScript 5 |
| 스타일 | Tailwind CSS v4 (`@theme` 커스텀 토큰) |
| 상태 관리 | Zustand (`useKnitChartStore`) |
| 도안 렌더링 | Canvas API (외부 차트 라이브러리 없음) |
| 색상 양자화 | Median Cut + CIE76 Lab 색차 |
| 이미지 업로드 | react-dropzone |
| 폰트 | Caveat · Nunito · Noto Serif KR |

---

## 주요 파일 구조

```
src/
├── app/
│   ├── page.tsx                      # 갤러리 홈 (Pinterest 마소느리)
│   ├── editor/page.tsx               # 패턴 에디터 (모드 선택 → 에디터)
│   ├── globals.css                   # 전역 스타일 + 마소느리 CSS
│   ├── layout.tsx
│   └── api/claude/route.ts           # Claude AI 프록시 (x-user-api-key 헤더 방식)
│
├── components/
│   ├── chart/KnitSymbolChart.tsx     # Canvas 도안 렌더러 (줌·팬·편집)
│   ├── crochet/CrochetSection.tsx    # 코바늘 네잎클로버 썸네일+모달
│   ├── draw/StitchPalette.tsx        # 기호 선택 팔레트
│   ├── gallery/PatternCard.tsx       # Pinterest 카드 (hover 하트·모드 뱃지)
│   ├── gallery/PatternModal.tsx      # 갤러리 상세 모달
│   ├── layout/Header.tsx             # 헤더 (sticky, 네비+언어토글+시작하기)
│   ├── layout/LanguageToggle.tsx     # KO/EN 전역 토글
│   ├── pattern/PatternText.tsx       # 텍스트 패턴 출력
│   └── export/ExportPanel.tsx        # PNG/PDF 내보내기
│
├── hooks/
│   ├── useKnitChartState.ts          # Zustand 스토어 (메인)
│   └── useDrawTool.ts                # 그리기·채우기·대칭·undo/redo
│
├── lib/
│   ├── crochet/drawCrochetClover.ts  # 네잎클로버 Canvas 렌더러
│   ├── imageProcessing/
│   │   ├── imageToColorChart.ts      # 이미지→KnitChartData 변환
│   │   ├── colorQuantizer.ts         # Median Cut
│   │   └── colorMapper.ts            # 픽셀→팔레트 인덱스
│   ├── knitting/
│   │   ├── stitchLibrary.ts          # 18가지 CYC 기호 DB
│   │   ├── patternGenerator.ts       # 셀→텍스트 패턴 생성
│   │   └── drawStitchSymbol.ts       # 기호별 Canvas path 함수
│   ├── gallery/store.ts              # localStorage 갤러리 저장소
│   └── utils/
│       ├── colorUtils.ts             # RGB↔Lab 변환
│       └── exportUtils.ts            # PNG/PDF 내보내기 로직
│
└── types/
    └── knit.ts                       # KnitStitch, ChartCell, KnitChartData 타입
```

---

## 핵심 타입 (`src/types/knit.ts`)

```typescript
interface ChartCell {
  stitchId: string;
  yarnColor?: string;  // 컬러워크 모드용
}

interface KnitChartData {
  id: string;
  name: string;
  mode: 'image' | 'draw';
  width: number;
  height: number;
  cells: ChartCell[][];
  yarnPalette: { color: string; label: string }[];
  language: 'ko' | 'en';
}
```

---

## Zustand 스토어 주요 상태 (`useKnitChartState.ts`)

```typescript
chart: KnitChartData | null
setChart(chart): void
updateCell(row, col, cell): void
gridWidth, gridHeight, colorCount: number
setGridWidth, setGridHeight, setColorCount
language: 'ko' | 'en'
setLanguage
isProcessing: boolean
selectedYarnColor: string
setSelectedYarnColor
selectedStitchId: string
setSelectedStitchId
drawMode: 'pencil' | 'fill'
setDrawMode
symmetryMode: 'none' | 'horizontal' | 'vertical' | 'both'
setSymmetryMode
updateYarnLabel(index, label): void
updateYarnColor(index, color): void
undo(): void   // useDrawTool에서 접근
redo(): void
resetChart(): void
```

---

## 구현된 주요 기능

### 에디터 (`editor/page.tsx`)
- `AppMode`: `'select' | 'image-upload' | 'draw-setup' | 'editor'`
- 갤러리에서 "편집하기" 진입 시 `chart` 스토어에 이미 있으면 바로 `'editor'` 모드
- 이미지 업로드 → `img.naturalWidth / naturalHeight`로 격자 크기 자동 계산 (비율 보존)
- 툴바: ✏️ 연필 / 🪣 채우기 모드 토글 + ✕/↔/↕/✦ 대칭 모드 토글

### KnitSymbolChart (`components/chart/KnitSymbolChart.tsx`)
- Space 키 → `document.documentElement.style.overflow = 'hidden'` (페이지 스크롤 차단)
- Space + 드래그 = 팬 이동
- 휠 = 줌 (0.3~8배)
- `editable` prop: true면 그리기, false면 팬만
- `compact` prop: 썸네일 모드 (격자·번호 없음, 기호만 표시)
- `storeChart ?? chartData` — 편집 모드만 스토어 구독, 갤러리 썸네일은 prop 고정

### useDrawTool (`hooks/useDrawTool.ts`)
- `applySingleCell(row, col, erase)` — 단일 셀 그리기 (대칭 없음)
- `paintCell(row, col, erase)` — 대칭 포함 그리기
- `floodFill(row, col, erase)` — BFS, 완료 후 `setChart` 한번만 호출 (성능)
- `startDraw(row, col, erase)` — fill 모드면 floodFill, pencil이면 paintCell
- Undo/Redo: 모듈 레벨 `_undoStack`, `_redoStack` (20단계)

### 갤러리 (`app/page.tsx`)
- CSS 마소느리: `columns: 2~5` (반응형)
- 태그 필터 + 실시간 검색
- localStorage 기반 갤러리 저장 (`lib/gallery/store.ts`)
- 갤러리 카드에서 "편집하기" → 스토어에 차트 주입 후 `/editor` 이동

### 코바늘 네잎클로버 (`lib/crochet/drawCrochetClover.ts`)
- 도안: `(mr, ch3, dc5 bo, ch3, sl st) × 4`
- 600×600 Canvas, 4 방향 회전으로 꽃잎 렌더링
- `CrochetSection.tsx`: 썸네일 클릭 → 모달 (Canvas + 텍스트 도안)

### 헤더 (`components/layout/Header.tsx`)
- sticky, glassmorphism
- 네비게이션 활성 링크: pill 스타일 (rose-light bg)
- `<LanguageToggle />` 내장

---

## 디자인 토큰 (globals.css)

```
--color-rose: #C97B6B       (주요 강조·버튼)
--color-cream: #FAF6F1      (전체 배경)
--color-ink: #5C3317        (텍스트)
--color-lavender: #D4C5E2   (보조 강조)
--color-paper: #FFF8F4
--color-warm-border: rgba(92,51,23,0.12)
--color-ink-mid: #8B5E3C
--color-ink-light: #B08060
--color-rose-light: #F9EDE9
--color-rose-dark: #A05A4A
--color-warm-gray: #F0EAE4
```

---

## 18가지 기호 DB (`lib/knitting/stitchLibrary.ts`)

| id | 기호 | 한국어 | 영어 |
|----|------|--------|------|
| k | □ | 겉뜨기 | Knit |
| p | — | 안뜨기 | Purl |
| yo | ○ | 걸기코 | Yarn Over |
| k2tog | / | 오른코 겹치기 | K2tog |
| ssk | \ | 왼코 겹치기 | SSK |
| sk2p | ↑ | 가운데3코 모아 | SK2P |
| k3tog | // | 오른3코 겹치기 | K3tog |
| sssk | \\ | 왼3코 겹치기 | SSSK |
| kfb | ∧ | 앞뒤 늘리기 | KFB |
| m1l | ↖ | 왼코 늘리기 | M1L |
| m1r | ↗ | 오른코 늘리기 | M1R |
| sl1k | > | 겉방향 미끄러뜨리기 | Sl1k |
| sl1p | ◁ | 안방향 미끄러뜨리기 | Sl1p |
| co | ★ | 코잡기 | CO |
| bo | ✕ | 코막음 | BO |
| ns | ▨ | 빈칸 | No Stitch |
| 2-2rc | ⤴ | 오른 케이블(2/2) | 2/2RC |
| 2-2lc | ⤵ | 왼 케이블(2/2) | 2/2LC |

---

## 스크린샷 자동화

- `scripts/screenshot.mjs` — Puppeteer로 5장 캡처
- 출력: `docs/screenshots/01_gallery.png` ~ `05_editor_empty.png`
- 실행: `npm run screenshot` (개발 서버 켜진 상태에서)

---

## 보안 체크 결과 (2026-04-05)

- ✅ `.env` 파일 없음 (`.gitignore`에 포함)
- ✅ 소스 코드에 API 키/비밀번호 없음
- ✅ `route.ts`는 `req.headers.get('x-user-api-key')` 방식으로 클라이언트 키 사용
- ⚠️ `CLAUDE.md` / `AGENTS.md` 가 저장소에 포함됨 (민감 정보는 아님)
- ⚠️ git commit 이메일이 public (GitHub Privacy 설정으로 숨길 수 있음)

---

## 남은 선택 작업

1. `CLAUDE.md` / `AGENTS.md` 저장소에서 제거:
   ```bash
   echo "CLAUDE.md" >> .gitignore
   echo "AGENTS.md" >> .gitignore
   git rm --cached CLAUDE.md AGENTS.md
   git commit -m "remove Claude Code internal config files"
   git push
   ```

2. GitHub 계정 Settings → Emails → "Keep my email address private" 체크

---

## 개발 서버 실행

```bash
cd C:\Users\user\knit-chart-generator
npm run dev
# → http://localhost:3000
```

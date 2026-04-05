# Cro-share 🧶

> 이미지를 뜨개질 도안으로 — 대바늘·코바늘 패턴 메이커

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Zustand](https://img.shields.io/badge/Zustand-state_mgmt-orange)](https://zustand-demo.pmnd.rs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📸 스크린샷

### 갤러리 홈 — Pinterest 스타일 마소느리

![갤러리 홈](docs/screenshots/01_gallery.png)

> 태그 필터 · 실시간 검색 · 좋아요 · hover 하트 저장 버튼

---

### 갤러리 전체 스크롤

![갤러리 전체](docs/screenshots/02_gallery_full.png)

---

### 패턴 만들기 — 모드 선택

![에디터 선택](docs/screenshots/03_editor_select.png)

> 이미지로 시작 / 직접 그리기 두 가지 입력 모드

---

### 이미지 업로드 → 자동 컬러워크 생성

![이미지 업로드](docs/screenshots/04_image_upload.png)

> 비율 보존 자동 격자 크기 · 실 색상 수 조절 · 즉시 도안 생성

---

### 도트 그리기 에디터

![에디터](docs/screenshots/05_editor_empty.png)

> 기호 팔레트 · 대칭 모드 · 채우기 모드 · undo/redo

---

## ✨ 주요 기능

### 🖼 이미지 → 컬러워크 도안

- 사진 업로드 → **Median Cut** 색상 양자화로 실 색상 팔레트 자동 추출
- **이미지 비율 자동 보존** — `naturalWidth / naturalHeight` 기반 격자 크기 계산 (찌부러짐 방지)
- 실 색상 컬러휠로 편집 → 도안 전체 즉시 반영
- Canvas 기반 샘플 이미지 제공 (꽃·고양이·산, 5~6가지 뚜렷한 색상)

### ✏️ 직접 그리기 모드

- **18가지 CYC 표준 기호** — 겉뜨기·안뜨기·걸기코·줄임코·늘림코·케이블 등
- **대칭 그리기 4모드** — 없음 / ↔ 좌우 / ↕ 상하 / ✦ 전체 (미러 셀 동시 칠하기)
- **채우기 모드 (Flood Fill)** — BFS로 인접 동일 영역 한꺼번에 채우기
- Space+드래그 이동 / 휠 확대·축소 / 우클릭 지우기
- **Undo/Redo** 20단계 (Ctrl+Z / Ctrl+Y)

### 🍀 코바늘 도안 샘플 (Beta)

- 네잎클로버 모티프 Canvas 렌더링 — `(mr, ch3, dc5 bo, ch3, sl st) × 4`
- 기호 도안 + 텍스트 도안 동시 표시 · 색상 범례

### 🏛 커뮤니티 갤러리

- Pinterest 스타일 **CSS 마소느리** 그리드 (2~5열 반응형)
- 태그 필터 + 검색 · 좋아요 · Hover 하트 버튼
- 내 패턴 공유 → 갤러리 자동 등록 (localStorage)
- 갤러리에서 "편집하기" → 에디터로 차트 불러오기

### 🌐 한국어 / English 토글

- 헤더에서 전역 언어 전환
- 텍스트 패턴 · 기호 팔레트 · UI 레이블 동시 전환

---

## 🛠 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | Next.js 16.2 (App Router, Turbopack) |
| 언어 | TypeScript 5 |
| 스타일 | Tailwind CSS v4 (`@theme` 커스텀 토큰) |
| 상태 관리 | Zustand |
| 도안 렌더링 | Canvas API (외부 차트 라이브러리 없음) |
| 색상 양자화 | Median Cut + CIE76 Lab 색차 |
| 이미지 업로드 | react-dropzone |
| 폰트 | Caveat · Nunito · Noto Serif KR |

---

## 🚀 시작하기

```bash
# 1. 클론
git clone https://github.com/yeyounglim-01/cro-share.git
cd cro-share

# 2. 의존성 설치
npm install

# 3. 개발 서버
npm run dev
# → http://localhost:3000
```

---

## 🗂 프로젝트 구조

```
src/
├── app/
│   ├── page.tsx                  # 갤러리 홈
│   └── editor/page.tsx           # 패턴 에디터
│
├── components/
│   ├── chart/KnitSymbolChart.tsx # 도안 Canvas (줌·팬·편집)
│   ├── crochet/CrochetSection.tsx# 코바늘 도안 섹션
│   ├── draw/StitchPalette.tsx    # 기호 팔레트
│   ├── gallery/PatternCard.tsx   # 마소느리 카드
│   ├── layout/Header.tsx         # 헤더 + 언어 토글
│   └── pattern/PatternText.tsx   # 텍스트 패턴 출력
│
├── hooks/
│   ├── useKnitChartState.ts      # Zustand 스토어
│   └── useDrawTool.ts            # 그리기·채우기·대칭·history
│
└── lib/
    ├── crochet/drawCrochetClover.ts
    ├── imageProcessing/          # Median Cut · 이미지→도안
    ├── knitting/                 # 기호 DB · 패턴 생성 · Canvas 드로잉
    └── utils/                    # 색상 · 내보내기
```

---

## 🎨 디자인

따뜻한 수채화 파스텔 팔레트 · Caveat(스케치) · Nunito(본문) · Noto Serif KR

| 토큰 | 색상 | 용도 |
|------|------|------|
| `--color-rose` | `#C97B6B` | 주요 강조 · 버튼 |
| `--color-cream` | `#FAF6F1` | 전체 배경 |
| `--color-ink` | `#5C3317` | 텍스트 |
| `--color-lavender` | `#D4C5E2` | 보조 강조 |

---

## 📝 License

MIT © 2026 [yeyounglim-01](https://github.com/yeyounglim-01)

/**
 * 네잎클로버 코바늘 도안 Canvas 렌더러
 * 패턴: mr, (ch3, dc5 bo, ch3, sl st) × 4
 */

const BLUE = '#2B8BD4';
const GREEN = '#5CB85C';
const PINK = '#C040C8';

function chainOval(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  axisAngle: number,
  color = BLUE,
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(axisAngle);
  ctx.beginPath();
  ctx.ellipse(0, 0, 9, 16, 0, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;
  ctx.stroke();
  ctx.restore();
}

function doubleCrochet(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  dirAngle: number, // angle from center → stitch
  color = BLUE,
) {
  ctx.save();
  ctx.translate(cx, cy);
  // dirAngle points outward; rotate so symbol axis aligns radially
  // symbol drawn vertically: top (-y) = outer end, bottom (+y) = inner end (ring)
  ctx.rotate(dirAngle + Math.PI / 2);

  const hH = 20; // half-height
  const bW = 8;  // crossbar half-width

  ctx.strokeStyle = color;
  ctx.lineWidth = 2.2;
  ctx.lineCap = 'round';

  // Main stem
  ctx.beginPath();
  ctx.moveTo(0, -hH);
  ctx.lineTo(0, hH);
  ctx.stroke();

  // 2 horizontal crossbars (한길긴코 = dc = 2 marks)
  for (const y of [-hH * 0.2, hH * 0.15]) {
    ctx.beginPath();
    ctx.moveTo(-bW, y);
    ctx.lineTo(bW, y);
    ctx.stroke();
  }

  // T-head at outer end (top)
  ctx.beginPath();
  ctx.moveTo(-bW * 1.35, -hH);
  ctx.lineTo(bW * 1.35, -hH);
  ctx.stroke();

  ctx.restore();
}

function slipStitch(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  color = BLUE,
) {
  ctx.beginPath();
  ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

/**
 * 하나의 꽃잎을 "위쪽(-y 방향)" 기준으로 그린다.
 * 호출 전 ctx를 center 로 translate + rotate 해서 방향 조정.
 */
function drawPetalUp(ctx: CanvasRenderingContext2D) {
  // ── DC fan (dc5): -90° 기준 ±32° 범위 5개 ──
  const BASE = -Math.PI / 2;
  const SPREAD = (32 * Math.PI) / 180;
  const R_DC = 160;

  for (let i = 0; i < 5; i++) {
    const a = BASE + (i - 2) * (SPREAD / 2);
    doubleCrochet(ctx, R_DC * Math.cos(a), R_DC * Math.sin(a), a);
  }

  // ── 왼쪽 사슬 아치 (ch3) ──
  const leftArch: [number, number][] = [
    [-70, -92],
    [-98, -124],
    [-94, -158],
  ];
  for (const [x, y] of leftArch) {
    chainOval(ctx, x, y, Math.atan2(y, x) + Math.PI / 2);
  }

  // ── 오른쪽 사슬 아치 (ch3) ──
  const rightArch: [number, number][] = [
    [70, -92],
    [98, -124],
    [94, -158],
  ];
  for (const [x, y] of rightArch) {
    chainOval(ctx, x, y, Math.atan2(y, x) + Math.PI / 2);
  }
}

/**
 * 600×600 캔버스에 네잎클로버 코바늘 도안을 그린다.
 */
export function drawCrochetClover(canvas: HTMLCanvasElement) {
  const S = 600;
  canvas.width = S;
  canvas.height = S;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const cx = S / 2, cy = S / 2;
  const RING_R = 60;

  // ── 배경 ──
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, S, S);

  // ── 매직원형코 (중앙 원) ──
  ctx.beginPath();
  ctx.arc(cx, cy, RING_R, 0, Math.PI * 2);
  ctx.strokeStyle = GREEN;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = '#333';
  ctx.font = '14px "Noto Sans KR", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('매직원형코', cx, cy);

  // ── 4개 꽃잎: 위·오른쪽·아래·왼쪽 ──
  const petalAngles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];

  for (const baseAngle of petalAngles) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(baseAngle + Math.PI / 2);
    drawPetalUp(ctx);
    ctx.restore();
  }

  // ── 빼뜨기 점 (링 엣지, 꽃잎 4곳) ──
  for (const a of petalAngles) {
    slipStitch(ctx, cx + RING_R * Math.cos(a), cy + RING_R * Math.sin(a));
  }

  // ── 시작 사슬 (핑크) — 오른쪽 아래 방향으로 꼬리 표현 ──
  const startAngle = Math.PI * 0.7;
  for (let i = 0; i < 5; i++) {
    const r = 82 + i * 28;
    chainOval(ctx, cx + r * Math.cos(startAngle), cy + r * Math.sin(startAngle), startAngle + Math.PI / 2, PINK);
    // 사슬 사이 연결 점
    const dr = r + 14;
    slipStitch(ctx, cx + dr * Math.cos(startAngle), cy + dr * Math.sin(startAngle), PINK);
  }
}

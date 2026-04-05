/** 캔버스에 뜨개 기호를 그리는 공유 유틸리티 */
export function drawStitchSymbol(
  ctx: CanvasRenderingContext2D,
  id: string,
  x: number, y: number,
  w: number, h: number,
  fgColor: string
) {
  const pad = Math.max(1, w * 0.16); // 셀 크기에 비례한 패딩 (compact에서도 보이도록)
  const cx = x + w / 2;
  const cy = y + h / 2;
  ctx.strokeStyle = fgColor;
  ctx.fillStyle = fgColor;
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (id) {
    case 'k':
      ctx.beginPath();
      ctx.moveTo(x + pad, y + pad + 1);
      ctx.lineTo(cx, y + h - pad);
      ctx.lineTo(x + w - pad, y + pad + 1);
      ctx.stroke();
      break;

    case 'p':
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(x + pad, cy);
      ctx.lineTo(x + w - pad, cy);
      ctx.stroke();
      break;

    case 'yo':
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(w, h) / 2 - pad, 0, Math.PI * 2);
      ctx.stroke();
      break;

    case 'k2tog':
      ctx.beginPath();
      ctx.moveTo(x + w - pad, y + pad);
      ctx.lineTo(x + pad, y + h - pad);
      ctx.stroke();
      break;

    case 'ssk':
      ctx.beginPath();
      ctx.moveTo(x + pad, y + pad);
      ctx.lineTo(x + w - pad, y + h - pad);
      ctx.stroke();
      break;

    case 'sk2p':
      ctx.beginPath();
      ctx.moveTo(cx, y + pad);
      ctx.lineTo(x + w - pad, y + h - pad);
      ctx.lineTo(x + pad, y + h - pad);
      ctx.closePath();
      ctx.stroke();
      break;

    case 'k3tog':
      ctx.beginPath();
      ctx.moveTo(x + w - pad, y + pad);
      ctx.lineTo(cx, y + h - pad);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + w - pad - 5, y + pad);
      ctx.lineTo(x + pad, y + h - pad);
      ctx.stroke();
      break;

    case 'sssk':
      ctx.beginPath();
      ctx.moveTo(x + pad, y + pad);
      ctx.lineTo(cx, y + h - pad);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + pad + 5, y + pad);
      ctx.lineTo(x + w - pad, y + h - pad);
      ctx.stroke();
      break;

    case 'kfb':
      ctx.beginPath();
      ctx.moveTo(x + pad, y + pad);
      ctx.lineTo(cx, y + h - pad);
      ctx.lineTo(x + w - pad, y + pad);
      ctx.stroke();
      break;

    case 'm1l':
    case 'm1r': {
      const lean = id === 'm1l' ? -2 : 2;
      ctx.beginPath();
      ctx.moveTo(x + pad, y + h - pad);
      ctx.lineTo(cx + lean, y + pad);
      ctx.lineTo(x + w - pad, y + h - pad);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + pad, cy);
      ctx.lineTo(x + w - pad, cy);
      ctx.stroke();
      break;
    }

    case 'sl1k':
    case 'sl1p':
      ctx.beginPath();
      ctx.moveTo(x + pad, cy);
      ctx.lineTo(x + w - pad, cy);
      ctx.moveTo(x + w - pad - 5, cy - 4);
      ctx.lineTo(x + w - pad, cy);
      ctx.lineTo(x + w - pad - 5, cy + 4);
      ctx.stroke();
      break;

    case 'co': {
      const r = Math.min(w, h) / 2 - pad - 1;
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(cx - r * Math.cos(angle), cy - r * Math.sin(angle));
        ctx.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
        ctx.stroke();
      }
      break;
    }

    case 'bo':
      ctx.beginPath();
      ctx.moveTo(x + pad, y + pad);
      ctx.lineTo(x + w - pad, y + h - pad);
      ctx.moveTo(x + w - pad, y + pad);
      ctx.lineTo(x + pad, y + h - pad);
      ctx.stroke();
      break;

    case 'ns':
      ctx.fillStyle = '#C0B8B0';
      ctx.fillRect(x, y, w, h);
      break;

    case '2-2rc': {
      const tw = w * 4;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y + pad);
      ctx.bezierCurveTo(x + tw * 0.5, y + pad, x + tw * 0.5, y + h - pad, x + tw, y + h - pad);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y + h - pad);
      ctx.bezierCurveTo(x + tw * 0.5, y + h - pad, x + tw * 0.5, y + pad, x + tw, y + pad);
      ctx.stroke();
      break;
    }

    case '2-2lc': {
      const tw2 = w * 4;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y + h - pad);
      ctx.bezierCurveTo(x + tw2 * 0.5, y + h - pad, x + tw2 * 0.5, y + pad, x + tw2, y + pad);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y + pad);
      ctx.bezierCurveTo(x + tw2 * 0.5, y + pad, x + tw2 * 0.5, y + h - pad, x + tw2, y + h - pad);
      ctx.stroke();
      break;
    }

    case 'p2tog':
      ctx.beginPath();
      ctx.moveTo(x + w - pad, y + pad);
      ctx.lineTo(x + pad, y + h - pad);
      ctx.stroke();
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + pad, cy);
      ctx.lineTo(x + w - pad, cy);
      ctx.stroke();
      break;

    default: {
      ctx.font = `bold ${Math.max(7, h * 0.36)}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(id.substring(0, 3), cx, cy);
      break;
    }
  }
}

'use client';

import { useEffect, useRef } from 'react';

export default function CroShareSVG() {
  const textRef = useRef<SVGTextElement>(null);

  useEffect(() => {
    if (!textRef.current) return;

    // SVG text의 실제 경로 길이 계산
    const len = textRef.current.getComputedTextLength();

    // stroke-dasharray로 전체 길이 설정
    textRef.current.style.strokeDasharray = `${len}`;
    // 처음에는 전체가 숨겨진 상태
    textRef.current.style.strokeDashoffset = `${len}`;

    // 약간의 딜레이 후 애니메이션 시작
    setTimeout(() => {
      if (textRef.current) {
        textRef.current.style.animation = `drawYarn 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards`;
      }
    }, 200);
  }, []);

  return (
    <svg
      width="100%"
      viewBox="0 0 900 200"
      style={{
        maxWidth: 800,
        overflow: 'visible',
        filter: 'drop-shadow(0 0 30px rgba(201, 123, 107, 0.15))',
      }}
    >
      <text
        ref={textRef}
        x="450"
        y="160"
        textAnchor="middle"
        fontFamily="'Caveat', cursive"
        fontSize="130"
        fontWeight="700"
        fill="none"
        stroke="#C97B6B"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        Cro-share
      </text>
    </svg>
  );
}

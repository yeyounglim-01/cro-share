export default function YarnIllustration() {
  return (
    <svg viewBox="0 0 580 420" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <filter id="soft-blur">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
        <filter id="watercolor">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
        <radialGradient id="yarn-pink" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#F5B8C8" stopOpacity="0.95"/>
          <stop offset="60%" stopColor="#F098B8" stopOpacity="0.85"/>
          <stop offset="100%" stopColor="#E07898" stopOpacity="0.7"/>
        </radialGradient>
        <radialGradient id="yarn-rose" cx="45%" cy="35%" r="55%">
          <stop offset="0%" stopColor="#F5C5C0" stopOpacity="0.95"/>
          <stop offset="70%" stopColor="#E8A098" stopOpacity="0.85"/>
          <stop offset="100%" stopColor="#D08080" stopOpacity="0.7"/>
        </radialGradient>
        <radialGradient id="yarn-lavender" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#D8C8F0" stopOpacity="0.95"/>
          <stop offset="65%" stopColor="#C0A8E0" stopOpacity="0.85"/>
          <stop offset="100%" stopColor="#A888D0" stopOpacity="0.7"/>
        </radialGradient>
        <radialGradient id="yarn-cream" cx="50%" cy="40%" r="55%">
          <stop offset="0%" stopColor="#FFF0D8" stopOpacity="0.95"/>
          <stop offset="65%" stopColor="#F0D8B8" stopOpacity="0.85"/>
          <stop offset="100%" stopColor="#E0C098" stopOpacity="0.7"/>
        </radialGradient>
        <linearGradient id="desk" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F2E0D0"/>
          <stop offset="100%" stopColor="#E8D0BC"/>
        </linearGradient>
        <linearGradient id="lamp-shade" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5D098"/>
          <stop offset="100%" stopColor="#E8B870"/>
        </linearGradient>
      </defs>

      {/* ── Background wash ── */}
      <rect width="580" height="420" fill="#FFF5EE" rx="20"/>
      <ellipse cx="290" cy="380" rx="280" ry="60" fill="#F2E0D0" opacity="0.4"/>

      {/* ── Desk surface ── */}
      <rect x="20" y="290" width="540" height="110" rx="4" fill="url(#desk)" opacity="0.6"/>
      <rect x="20" y="290" width="540" height="3" rx="2" fill="#D4B896" opacity="0.5"/>

      {/* ── Lamp ── */}
      <rect x="80" y="130" width="6" height="165" rx="3" fill="#D4B896"/>
      <rect x="86" y="130" width="3" height="60" rx="1.5" fill="#C4A070" opacity="0.6" transform="rotate(-15 88 130)"/>
      <polygon points="60,130 120,130 105,175 75,175" fill="url(#lamp-shade)" filter="url(#soft-blur)"/>
      <polygon points="60,130 120,130 105,175 75,175" fill="none" stroke="#C4985A" strokeWidth="1" opacity="0.6"/>
      <ellipse cx="90" cy="175" rx="16" ry="4" fill="#F5D098" opacity="0.7"/>
      {/* lamp glow */}
      <ellipse cx="90" cy="200" rx="50" ry="30" fill="#FFF5D0" opacity="0.25"/>

      {/* ── Flowers/lavender in cup ── */}
      <rect x="130" y="240" width="28" height="50" rx="5" fill="#F0E0D0"/>
      <rect x="126" y="286" width="36" height="8" rx="3" fill="#E8D0BC"/>
      {/* stems */}
      {[136, 142, 150, 156].map((x, i) => (
        <line key={i} x1={x} y1={240} x2={x + (i % 2 === 0 ? -2 : 2)} y2={215} stroke="#8B9B6B" strokeWidth="1.5" opacity="0.8"/>
      ))}
      {/* flower heads */}
      <ellipse cx="134" cy="212" rx="5" ry="8" fill="#C898D8" opacity="0.85"/>
      <ellipse cx="140" cy="208" rx="4" ry="7" fill="#D4A8E8" opacity="0.85"/>
      <ellipse cx="148" cy="212" rx="5" ry="9" fill="#B888C8" opacity="0.85"/>
      <ellipse cx="154" cy="210" rx="4" ry="7" fill="#C898D8" opacity="0.85"/>

      {/* ── Coffee cup ── */}
      <rect x="430" y="270" width="50" height="40" rx="6" fill="#FDFAF8"/>
      <rect x="430" y="270" width="50" height="40" rx="6" fill="none" stroke="#E8D0BC" strokeWidth="1.5"/>
      <path d="M480,282 Q498,282 498,292 Q498,302 480,302" fill="none" stroke="#E8D0BC" strokeWidth="1.5"/>
      <ellipse cx="455" cy="270" rx="25" ry="5" fill="#F0E8E0"/>
      {/* coffee surface */}
      <ellipse cx="455" cy="275" rx="18" ry="3" fill="#C8A888" opacity="0.5"/>
      {/* steam */}
      <path d="M448,265 Q450,258 448,252" fill="none" stroke="#DDD0C8" strokeWidth="1.5" opacity="0.6"/>
      <path d="M455,263 Q457,255 455,248" fill="none" stroke="#DDD0C8" strokeWidth="1.5" opacity="0.6"/>
      <path d="M462,265 Q464,257 462,251" fill="none" stroke="#DDD0C8" strokeWidth="1.5" opacity="0.6"/>

      {/* ── Glasses ── */}
      <circle cx="345" cy="330" r="14" fill="none" stroke="#C4985A" strokeWidth="1.5" opacity="0.7"/>
      <circle cx="375" cy="332" r="14" fill="none" stroke="#C4985A" strokeWidth="1.5" opacity="0.7"/>
      <line x1="359" y1="330" x2="361" y2="331" stroke="#C4985A" strokeWidth="1.5" opacity="0.7"/>
      <line x1="317" y1="327" x2="331" y2="329" stroke="#C4985A" strokeWidth="1.5" opacity="0.7"/>
      <line x1="389" y1="329" x2="403" y2="326" stroke="#C4985A" strokeWidth="1.5" opacity="0.7"/>

      {/* ── Notebook / pattern book ── */}
      <rect x="385" y="288" width="55" height="42" rx="3" fill="#F8EEE8" transform="rotate(-3 385 288)"/>
      <rect x="385" y="288" width="55" height="42" rx="3" fill="none" stroke="#E8D0BC" strokeWidth="1" transform="rotate(-3 385 288)"/>
      {/* knit pattern dots */}
      {[0, 1, 2, 3].map(r =>
        [0, 1, 2, 3, 4].map(c => (
          <rect key={`${r}-${c}`}
            x={392 + c * 9 - r * 0.5}
            y={297 + r * 8}
            width={6} height={5}
            rx={0.5}
            fill={r % 2 === c % 2 ? '#F5B8C8' : '#FFFFFF'}
            opacity="0.8"
            transform="rotate(-3 392 297)"
          />
        ))
      )}

      {/* ── Yarn ball PINK (large, center-left) ── */}
      <ellipse cx="230" cy="330" rx="58" ry="52" fill="#FDE8EE" opacity="0.3" filter="url(#soft-blur)"/>
      <circle cx="228" cy="328" r="52" fill="url(#yarn-pink)" filter="url(#watercolor)"/>
      <circle cx="228" cy="328" r="52" fill="url(#yarn-pink)" opacity="0.5"/>
      {/* yarn spiral lines */}
      {[0, 1, 2, 3, 4, 5].map(i => (
        <ellipse key={i} cx="228" cy="328"
          rx={10 + i * 8} ry={6 + i * 5}
          fill="none" stroke="#E070A0" strokeWidth="0.8" opacity={0.35 - i * 0.04}
          transform={`rotate(${i * 30} 228 328)`}/>
      ))}
      <ellipse cx="225" cy="322" rx="14" ry="10" fill="#FDE0EC" opacity="0.4"/>

      {/* ── Yarn ball LAVENDER (back-right) ── */}
      <circle cx="310" cy="350" r="40" fill="url(#yarn-lavender)" filter="url(#watercolor)"/>
      <circle cx="310" cy="350" r="40" fill="url(#yarn-lavender)" opacity="0.45"/>
      {[0, 1, 2, 3].map(i => (
        <ellipse key={i} cx="310" cy="350"
          rx={8 + i * 7} ry={5 + i * 4}
          fill="none" stroke="#9868C8" strokeWidth="0.8" opacity={0.3 - i * 0.05}
          transform={`rotate(${i * 45} 310 350)`}/>
      ))}

      {/* ── Yarn ball ROSE (overlapping front) ── */}
      <circle cx="175" cy="355" r="38" fill="url(#yarn-rose)" filter="url(#watercolor)"/>
      <circle cx="175" cy="355" r="38" fill="url(#yarn-rose)" opacity="0.5"/>
      {[0, 1, 2].map(i => (
        <ellipse key={i} cx="175" cy="355"
          rx={9 + i * 7} ry={5 + i * 4}
          fill="none" stroke="#C07070" strokeWidth="0.8" opacity={0.3}
          transform={`rotate(${i * 60} 175 355)`}/>
      ))}

      {/* ── Yarn ball CREAM (small, right) ── */}
      <circle cx="375" cy="360" r="28" fill="url(#yarn-cream)" filter="url(#watercolor)"/>
      <circle cx="375" cy="360" r="28" fill="url(#yarn-cream)" opacity="0.5"/>

      {/* ── Trailing yarn ── */}
      <path d="M280,310 Q310,285 350,295 Q380,302 390,290"
        fill="none" stroke="#F098B8" strokeWidth="2" opacity="0.5" strokeLinecap="round"/>
      <path d="M175,317 Q150,295 120,305 Q100,312 90,295"
        fill="none" stroke="#E8A098" strokeWidth="2" opacity="0.4" strokeLinecap="round"/>

      {/* ── Knitting needles ── */}
      <line x1="120" y1="195" x2="280" y2="345" stroke="#C4985A" strokeWidth="3" strokeLinecap="round" opacity="0.75"/>
      <circle cx="120" cy="195" r="4" fill="#D4A870" opacity="0.8"/>
      <line x1="145" y1="185" x2="295" y2="340" stroke="#C4985A" strokeWidth="3" strokeLinecap="round" opacity="0.7"/>
      <circle cx="145" cy="185" r="4" fill="#D4A870" opacity="0.8"/>
      {/* yarn on needle */}
      <path d="M210,265 Q230,255 250,270 Q260,278 245,290"
        fill="none" stroke="#F5B8C8" strokeWidth="1.5" opacity="0.7"/>
      <path d="M220,272 Q240,262 258,276"
        fill="none" stroke="#F5B8C8" strokeWidth="1.5" opacity="0.6"/>

      {/* ── Scattered pins/markers ── */}
      {[[360, 295], [340, 280], [380, 275]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="4" fill={['#F098B8', '#D4A870', '#C898D8'][i]} opacity="0.8"/>
          <line x1={x} y1={y + 4} x2={x} y2={y + 12} stroke={['#E07898', '#C4885A', '#B888C8'][i]} strokeWidth="1.5" opacity="0.7"/>
        </g>
      ))}

      {/* ── Soft shadow under items ── */}
      <ellipse cx="230" cy="388" rx="65" ry="10" fill="#D4B896" opacity="0.2"/>
      <ellipse cx="310" cy="395" rx="45" ry="8" fill="#D4B896" opacity="0.15"/>
    </svg>
  );
}

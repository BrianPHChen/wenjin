// 暫代用的 Q 版鄉長 SVG。各部件分組，動作由 mascot.css 的 class 驅動：
//   .m-body（身體，呼吸） .m-head（頭） .m-eyes（眨眼） .m-arm-l / .m-arm-r（肩膀為軸旋轉）
// 之後換成正式美術時，只要保持這些 class 與肩膀/脖子軸心位置即可沿用動作。

const SKIN = '#f6c29a'
const SKIN_SHADE = '#eba882'
const HAIR = '#eceff3'
const HAIR_LINE = '#bcc3ce'
const SHIRT = '#f5f8fc'
const SHIRT_LINE = '#c5cfdc'
const VEST = '#e8dcbf'
const VEST_LINE = '#c9b993'
const NAVY = '#2d3552'
const INK = '#2a2721'

function Arm({ side }: { side: 'l' | 'r' }) {
  // 以左臂畫好，右臂鏡射
  const flip = side === 'r' ? 'translate(120 0) scale(-1 1)' : undefined
  return (
    <g className={`m-arm m-arm-${side}`}>
      <g transform={flip}>
        <path
          d="M35 95 C29 99 26 110 26 124 C26 128 33 129 34 125 C35 114 37 106 41 100 Z"
          fill={SHIRT}
          stroke={SHIRT_LINE}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path d="M26 121 h8.5" stroke={SHIRT_LINE} strokeWidth="1" />
        <circle cx="30" cy="129" r="5.2" fill={SKIN} stroke={SKIN_SHADE} strokeWidth="1" />
      </g>
    </g>
  )
}

export function MayorFigure() {
  return (
    <svg className="m-figure" viewBox="0 0 120 150" aria-hidden="true">
      <g className="m-body">
        {/* 襯衫 + 背心 */}
        <path d="M37 92 Q60 84 83 92 L90 141 Q60 149 30 141 Z" fill={VEST} stroke={VEST_LINE} strokeWidth="1.2" strokeLinejoin="round" />
        <path d="M48 89 L60 109 L72 89 Z" fill={SHIRT} />
        <path d="M48 89 L55 99 L60 93 Z M72 89 L65 99 L60 93 Z" fill={SHIRT} stroke={SHIRT_LINE} strokeWidth="1" strokeLinejoin="round" />
        <path d="M46 90 L60 111 L74 90" fill="none" stroke={NAVY} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <path d="M60 111 V146" stroke={NAVY} strokeWidth="1.6" />
        <rect x="58.6" y="114" width="2.8" height="6" rx="1.2" fill="#9aa3b5" />
        {/* 胸章（通用綠色圓章） */}
        <circle cx="73" cy="121" r="5.4" fill="#fff" stroke="#3f9a4a" strokeWidth="2" />
        <path d="M73 117.6 C75.6 119.6 75.4 123 73 124.6 C70.6 123 70.4 119.6 73 117.6 Z" fill="#3f9a4a" />
      </g>

      <g className="m-head">
        <rect x="54" y="78" width="12" height="10" rx="3" fill={SKIN_SHADE} />
        <circle cx="29.5" cy="57" r="6.5" fill={SKIN} stroke={SKIN_SHADE} strokeWidth="1" />
        <circle cx="90.5" cy="57" r="6.5" fill={SKIN} stroke={SKIN_SHADE} strokeWidth="1" />
        <ellipse cx="60" cy="54" rx="31" ry="30" fill={SKIN} />
        {/* 白髮 */}
        <path
          d="M28.5 54 Q25 22 60 18 Q95 22 91.5 54 Q89 40 79 35 Q70 31 62 33 Q50 30 40 35 Q31 41 28.5 54 Z"
          fill={HAIR}
          stroke={HAIR_LINE}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path d="M44 25 Q52 22 58 27 M64 23 Q74 22 80 28 M38 32 Q44 28 49 30" fill="none" stroke={HAIR_LINE} strokeWidth="1" strokeLinecap="round" />
        {/* 眉毛 */}
        <path d="M41 45 Q46 42 52 44 M68 44 Q74 42 79 45" fill="none" stroke="#9aa1ab" strokeWidth="1.6" strokeLinecap="round" />
        {/* 眼睛（眨眼用） */}
        <g className="m-eyes">
          <ellipse cx="47" cy="54" rx="2.7" ry="3.3" fill={INK} />
          <ellipse cx="73" cy="54" rx="2.7" ry="3.3" fill={INK} />
          <circle cx="48" cy="53" r="0.9" fill="#fff" />
          <circle cx="74" cy="53" r="0.9" fill="#fff" />
        </g>
        {/* 無框眼鏡 */}
        <g fill="rgba(255,255,255,0.18)" stroke="#a9b2bf" strokeWidth="1.3">
          <rect x="37" y="47" width="20" height="14" rx="4" />
          <rect x="63" y="47" width="20" height="14" rx="4" />
        </g>
        <path d="M57 53 Q60 51 63 53 M37 52 L31 54 M83 52 L89 54" fill="none" stroke="#a9b2bf" strokeWidth="1.2" />
        {/* 腮紅、鼻子、笑容 */}
        <ellipse cx="40" cy="66" rx="6" ry="3.6" fill="#f08a7a" opacity="0.45" />
        <ellipse cx="80" cy="66" rx="6" ry="3.6" fill="#f08a7a" opacity="0.45" />
        <path d="M57.5 62 Q60 65.5 62.5 62" fill="none" stroke={SKIN_SHADE} strokeWidth="1.6" strokeLinecap="round" />
        <path className="m-mouth" d="M49 69 Q60 81 71 69 Q60 73 49 69 Z" fill="#fff" stroke="#8a4a36" strokeWidth="1.4" strokeLinejoin="round" />
      </g>

      {/* 手臂畫在頭前面，舉手時才不會被頭擋住 */}
      <Arm side="l" />
      <Arm side="r" />
    </svg>
  )
}

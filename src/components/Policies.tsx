import candidate from '../assets/candidate.png'
import { policies, type Policy } from '../data/policies'

const NUMERALS = ['一', '二', '三', '四', '五', '六']

function Icon({ name }: { name: Policy['icon'] }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
  switch (name) {
    case 'care': // 長輩牽小孩
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <circle cx="8" cy="4.5" r="2.1" />
          <path d="M8 7.5v6.5l-2.5 6.5M8 14l2.5 6.5M8 10l4.5 2.5" />
          <circle cx="16.5" cy="10" r="1.7" />
          <path d="M16.5 12.2v4.3l-1.6 4M16.5 16.5l1.6 4M12.5 12.5l4 1.3" />
        </svg>
      )
    case 'sunrise': // 龜山島朝日
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M3 17h18M5 20.5h14" />
          <path d="M6 17c1-2.2 2.4-3.4 4-3.6 1-.1 1.6-1.6 2.6-1.6s1.4 1.4 2.4 2c1.4.8 2.6 1.6 3.4 3.2" />
          <path d="M12 3v2.5M5.6 5.6l1.6 1.6M18.4 5.6l-1.6 1.6M3 11h2M19 11h2" />
        </svg>
      )
    case 'sprout':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M12 21v-9" />
          <path d="M12 12c0-4 2.5-6.5 7-6.5 0 4.2-2.6 6.5-7 6.5Z" />
          <path d="M12 14.5c0-3.2-2-5.3-6-5.3 0 3.4 2.2 5.3 6 5.3Z" />
          <path d="M5 21h14" />
        </svg>
      )
    case 'bus':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <rect x="4.5" y="3.5" width="15" height="14" rx="2.5" />
          <path d="M4.5 11h15M8 20.5v-3M16 20.5v-3" />
          <circle cx="8.3" cy="14.3" r="0.9" />
          <circle cx="15.7" cy="14.3" r="0.9" />
        </svg>
      )
    case 'book':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5Z" />
          <path d="M12 6.5v13" />
        </svg>
      )
    case 'train': // 高鐵車頭
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M3 16.5h13.5c2.5 0 4.5-1.4 4.5-3 0-2.6-5-5.5-11-5.5H3" />
          <path d="M3 11.5h8.5M13 8.6l-1 2.9" />
          <path d="M2.5 20h19" />
        </svg>
      )
  }
}

export function Policies() {
  return (
    <section className="policies" id="policies" aria-labelledby="policies-title">
      <header className="policies-head">
        <p className="eyebrow">政見</p>
        <h2 id="policies-title">六大政見</h2>
      </header>

      <div className="policies-ring">
        <figure className="portrait">
          <div className="portrait-disc" aria-hidden="true" />
          <img src={candidate} alt="吳文進 插畫像" width={880} height={880} loading="lazy" decoding="async" />
        </figure>

        {policies.map((p, i) => (
          <article key={p.title} id={`policy-${i + 1}`} className={`policy policy-${i + 1} tone-${p.tone}`}>
            <div className="policy-top">
              <span className="policy-icon">
                <Icon name={p.icon} />
              </span>
              <span className="policy-num" aria-hidden="true">{NUMERALS[i]}</span>
            </div>
            <h3>{p.title}</h3>
            <ul>
              {p.points.map((pt) => (
                <li key={pt}>{pt}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}

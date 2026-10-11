import candidate from '../assets/candidate.png'
import { policies, POLICIES_PLACEHOLDER, type Policy } from '../data/policies'

function Icon({ name }: { name: Policy['icon'] }) {
  const common = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const
  switch (name) {
    case 'elder':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <circle cx="10" cy="4.5" r="2.2" />
          <path d="M10 7.5v6l-3 7M10 13.5l3 7M7 10l3-1 3 2" />
          <path d="M15.5 10.5v10M15.5 10.5a1.8 1.8 0 0 1 3.4 0" />
        </svg>
      )
    case 'family':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <circle cx="8" cy="5" r="2.2" />
          <path d="M8 8v7M5 21l3-6 3 6M5 11h6" />
          <circle cx="17" cy="11" r="1.8" />
          <path d="M17 13.5v4M15 21l2-3.5 2 3.5M12 14l5 .5" />
        </svg>
      )
    case 'finance':
      return (
        <svg viewBox="0 0 24 24" {...common}>
          <path d="M3 21h18M5 21V11M9.7 21V11M14.3 21V11M19 21V11" />
          <path d="M2.5 9 12 3.5 21.5 9Z" />
        </svg>
      )
  }
}

export function Policies() {
  return (
    <section className="policies" aria-labelledby="policies-title">
      <header className="policies-head">
        <p className="eyebrow">政見</p>
        <h2 id="policies-title">
          三大承諾
          {POLICIES_PLACEHOLDER && <span className="badge" title="政見細項為示意文字">示意內容</span>}
        </h2>
      </header>

      <div className="policies-ring">
        <figure className="portrait">
          <div className="portrait-disc" aria-hidden="true" />
          <img src={candidate} alt="候選人插畫像" width={880} height={880} loading="lazy" decoding="async" />
        </figure>

        {policies.map((p, i) => (
          <article key={p.title} className={`policy policy-${i + 1} tone-${p.tone}`}>
            <div className="policy-top">
              <span className="policy-icon">
                <Icon name={p.icon} />
              </span>
              <span className="policy-num">{String(i + 1).padStart(2, '0')}</span>
            </div>
            <h3>{p.title}</h3>
            <p className="policy-summary">{p.summary}</p>
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

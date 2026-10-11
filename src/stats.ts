import { villageStats, type VillageStats } from './data/villageStats'

export interface DerivedStats extends VillageStats {
  householdSize: number
  sexRatio: number
  agingIndex: number
}

function derive(s: VillageStats): DerivedStats {
  return {
    ...s,
    householdSize: s.population / s.households,
    sexRatio: (s.male / s.female) * 100,
    agingIndex: (s.age65plus / s.age0to14) * 100,
  }
}

const keys: (keyof VillageStats)[] = [
  'population', 'households', 'male', 'female', 'age0to14', 'age15to64', 'age65plus',
]

const total = Object.values(villageStats).reduce<VillageStats>(
  (acc, s) => {
    for (const k of keys) acc[k] += s[k]
    return acc
  },
  { population: 0, households: 0, male: 0, female: 0, age0to14: 0, age15to64: 0, age65plus: 0 },
)

export const townshipStats = derive(total)

export function statsFor(code: string | null): DerivedStats {
  if (!code) return townshipStats
  const s = villageStats[code]
  return s ? derive(s) : townshipStats
}

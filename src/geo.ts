import { geoArea, geoMercator, geoPath, geoTransform } from 'd3-geo'
import type { Feature, FeatureCollection, MultiPolygon } from 'geojson'
import raw from './data/zhuangwei.json'

export interface VillageProps {
  VILLCODE: string
  VILLNAME: string
  VILLENG: string
}

export type VillageFeature = Feature<MultiPolygon, VillageProps>

export interface Village {
  code: string
  name: string
  nameEn: string
  d: string
  centroid: [number, number]
  areaKm2: number
}

const collection = raw as unknown as FeatureCollection<MultiPolygon, VillageProps>

/** 畫布寬度（SVG user units），高度依鄉界外框比例自動計算 */
export const MAP_WIDTH = 560
/** 垂直壓縮比例，讓平面地圖看起來像斜放在桌上的板子 */
export const TILT = 0.84
const PADDING = 28
const EARTH_RADIUS_KM = 6371.0088

const mercator = geoMercator().fitWidth(MAP_WIDTH - PADDING * 2, collection)
const tilted = geoTransform({
  point(lon, lat) {
    const p = mercator([lon, lat])!
    this.stream.point(p[0] + PADDING, p[1] * TILT + PADDING)
  },
})
const path = geoPath(tilted)

const [[, y0], [, y1]] = path.bounds(collection)
export const MAP_HEIGHT = Math.ceil(y1 - y0 + PADDING * 2)

export const villages: Village[] = collection.features.map((f) => ({
  code: f.properties.VILLCODE,
  name: f.properties.VILLNAME,
  nameEn: f.properties.VILLENG.replace(/ Vil\.$/, ''),
  d: path(f) ?? '',
  centroid: path.centroid(f) as [number, number],
  areaKm2: geoArea(f) * EARTH_RADIUS_KM ** 2,
}))

/** 全鄉外框（16 村路徑合併），用來畫底座厚度 */
export const townshipD = villages.map((v) => v.d).join('')

export const townshipAreaKm2 = villages.reduce((s, v) => s + v.areaKm2, 0)

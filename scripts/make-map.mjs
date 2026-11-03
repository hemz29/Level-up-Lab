// Builds a printable outline map of South America (with country borders) from Natural Earth
// data (public domain, via the world-atlas package). Output: src/data/maps/south-america.json
// Run: node scripts/make-map.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { feature } from 'topojson-client';
import { geoMercator, geoPath, geoCentroid } from 'd3-geo';

const require = createRequire(import.meta.url);
const topo = JSON.parse(readFileSync(require.resolve('world-atlas/countries-50m.json'), 'utf8'));
const countries = feature(topo, topo.objects.countries).features;

// South America plus Panama (for the isthmus); keep only polygons whose centre lies in the box,
// which drops e.g. mainland France while keeping French Guiana.
const BOX = { west: -92.5, east: -33, south: -57, north: 13.2 };
const inBox = ([lon, lat]) => lon >= BOX.west && lon <= BOX.east && lat >= BOX.south && lat <= BOX.north;
const polygons = [];
for (const f of countries) {
  const g = f.geometry;
  if (!g) continue;
  const parts = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
  for (const coords of parts) {
    const poly = { type: 'Feature', geometry: { type: 'Polygon', coordinates: coords }, properties: {} };
    if (inBox(geoCentroid(poly))) polygons.push(poly);
  }
}

const W = 600, H = 820;
// fit to the land itself (a rectangle polygon is ambiguous on a sphere), leaving sea margins for labels
const projection = geoMercator().fitExtent([[40, 30], [W - 40, H - 30]], { type: 'FeatureCollection', features: polygons });
const path = geoPath(projection).digits(1);
const d = polygons.map((p) => path(p)).filter(Boolean).join('');
const k = projection.scale();
const [tx, ty] = projection.translate();
writeFileSync(new URL('../src/data/maps/south-america.json', import.meta.url),
  JSON.stringify({ name: 'South America', width: W, height: H, mercator: { k, tx, ty }, d, source: 'Natural Earth (public domain) via world-atlas' }) + '\n');
console.log('polygons', polygons.length, 'path chars', d.length);

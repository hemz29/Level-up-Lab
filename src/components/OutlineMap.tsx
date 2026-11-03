import southAmerica from '../data/maps/south-america.json';
import type { MapFeature } from '../data/questions/types';

const MAPS = { 'south-america': southAmerica };

/** Same Mercator projection the map was built with (scripts/make-map.mjs). */
function project(map: typeof southAmerica, lat: number, lon: number): [number, number] {
  const { k, tx, ty } = map.mercator;
  const λ = (lon * Math.PI) / 180;
  const φ = (lat * Math.PI) / 180;
  return [k * λ + tx, ty - k * Math.log(Math.tan(Math.PI / 4 + φ / 2))];
}

interface Props {
  map?: keyof typeof MAPS;
  /** Letters to show (identify questions). In the answer key, names are shown beside them. */
  marks?: (MapFeature & { letter?: string })[];
  showNames?: boolean;
  className?: string;
}

/** Printable outline map with country borders. Blank for "mark and name"; lettered dots for "identify". */
export function OutlineMap({ map = 'south-america', marks = [], showNames = false, className = '' }: Props) {
  const m = MAPS[map];
  return (
    <svg className={`outline-map ${className}`} viewBox={`0 0 ${m.width} ${m.height}`} role="img" aria-label={`Outline map of ${m.name}`}>
      <rect x="0" y="0" width={m.width} height={m.height} fill="#fff" stroke="#222" strokeWidth="1.5" />
      <path d={m.d} fill="#fff" stroke="#222" strokeWidth="0.9" strokeLinejoin="round" />
      {marks.filter((f) => f.letter).map((f) => {
        const [x, y] = project(m, f.lat, f.lon);
        return (
          <g key={f.id}>
            <circle cx={x} cy={y} r="4" fill="#222" />
            <text x={x + 7} y={y - 6} fontSize="20" fontWeight="700" fontFamily="Arial, sans-serif" fill="#222">{f.letter}</text>
            {showNames && <text x={x + 7} y={y + 14} fontSize="13" fontFamily="Arial, sans-serif" fill="#c0392b">{f.name}</text>}
          </g>
        );
      })}
      <g transform={`translate(${m.width - 46} 52)`} fontFamily="Arial, sans-serif" fontSize="14" fill="#222">
        <path d="M0 -30 L7 0 L0 -6 L-7 0 Z" fill="#222" />
        <text x="0" y="16" textAnchor="middle" fontWeight="700">N</text>
      </g>
      <text x="14" y={m.height - 14} fontSize="12" fontFamily="Arial, sans-serif" fill="#444">Map not to scale</text>
    </svg>
  );
}

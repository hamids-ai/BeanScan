import { useState, useMemo } from 'react'
import './CoffeeThumbnail.css'

// Colors drawn from the BeanScan design token palette
const BG_COLORS = [
  '#0e7490', // primary-700 teal
  '#155e75', // primary-800 deep teal
  '#0891b2', // primary-600 teal
  '#6366f1', // indigo (auto-section accent)
  '#7c3aed', // violet
  '#ca8a04', // amber (user-section accent)
  '#10b981', // success emerald
  '#059669', // emerald-600
  '#3b82f6', // info blue
  '#f97316', // rating-meh orange
  '#f59e0b', // warning amber
  '#475569', // neutral-600
]

const TEXT_COLORS = [
  '#cffafe', // primary-100 light cyan
  '#a5f3fc', // primary-200
  '#f1f5f9', // neutral-100 near-white
  '#fcd34d', // user-section-text amber
  '#a5b4fc', // auto-section-text indigo
  '#6ee7b7', // emerald-300
  '#bfdbfe', // blue-200
  '#fed7aa', // orange-200
  '#fde68a', // amber-200
  '#e2e8f0', // neutral-200
]

// Deterministic hash so the same coffee name always produces the same look
function hashName(name) {
  let hash = 0
  for (const c of (name || '')) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff
  return hash
}

// Returns the primary accent color for a coffee name — usable outside this component
export function getAccentColor(name) {
  return BG_COLORS[hashName(name) % BG_COLORS.length]
}

// Pick a color by index, ensuring it differs from the excluded index
function pick(arr, idx, excludeIdx = -1) {
  if (idx === excludeIdx) idx = (idx + 1) % arr.length
  return arr[idx]
}

// Builds a unique gradient style from the coffee name hash
function buildGradient(h) {
  const i1 = h % BG_COLORS.length
  const i2 = (h * 7 + 3) % BG_COLORS.length
  const i3 = (h * 19 + 7) % BG_COLORS.length
  const bg1 = BG_COLORS[i1]
  const bg2 = pick(BG_COLORS, i2, i1)
  const bg3 = pick(BG_COLORS, i3, i2)

  const angle = (h % 12) * 30  // 12 directions: 0°→330° in 30° steps
  const type = h % 4             // 4 distinct gradient styles

  const radialPositions = ['30% 30%', '70% 30%', '30% 70%', '70% 70%', '20% 50%', '80% 50%']
  const rPos = radialPositions[(h * 3) % radialPositions.length]

  let background
  if (type === 0) {
    // Diagonal linear — two colors
    background = `linear-gradient(${angle}deg, ${bg1}, ${bg2})`
  } else if (type === 1) {
    // Radial burst from an off-center point
    background = `radial-gradient(circle at ${rPos}, ${bg1} 0%, ${bg2} 100%)`
  } else if (type === 2) {
    // Linear with three color stops — more complexity
    background = `linear-gradient(${angle}deg, ${bg1} 0%, ${bg2} 55%, ${bg3} 100%)`
  } else {
    // Radial ellipse — softer, wider spread
    background = `radial-gradient(ellipse at ${rPos}, ${bg1} 0%, ${bg2} 60%, ${bg3} 100%)`
  }

  const textColor = TEXT_COLORS[(h * 13 + 5) % TEXT_COLORS.length]
  return { background, textColor }
}

// Renders a coffee bag image, or a vibrant gradient placeholder with the bag's initials.
// size: 'sm' (collection card 72×72) | 'lg' (detail screen full-width banner)
function CoffeeThumbnail({ imageUrl, name, size = 'sm' }) {
  const [imgFailed, setImgFailed] = useState(false)
  const initials = (name || '??').slice(0, 2).toUpperCase()

  const { background, textColor } = useMemo(() => buildGradient(hashName(name)), [name])

  if (imageUrl && !imgFailed) {
    return <img src={imageUrl} alt={name} className="coffee-thumbnail-img" onError={() => setImgFailed(true)} />
  }

  return (
    <div
      className={`coffee-thumbnail-placeholder coffee-thumbnail-placeholder-${size}`}
      style={{ background }}
    >
      <span className="coffee-thumbnail-initials" style={{ color: textColor }}>
        {initials}
      </span>
    </div>
  )
}

export default CoffeeThumbnail

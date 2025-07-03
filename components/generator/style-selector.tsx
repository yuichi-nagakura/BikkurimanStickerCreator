'use client';

interface StyleSelectorProps {
  rarity: string;
  onRarityChange: (rarity: string) => void;
  attribute: string;
  onAttributeChange: (attribute: string) => void;
}

const RARITIES = [
  { value: 'normal', label: 'ノーマル', color: 'from-gray-400 to-gray-600' },
  { value: 'rare', label: 'レア', color: 'from-blue-400 to-blue-600' },
  { value: 'super-rare', label: 'スーパーレア', color: 'from-yellow-400 to-orange-600' },
];

const ATTRIBUTES = [
  { value: '聖', label: '聖', icon: '✨' },
  { value: '魔', label: '魔', icon: '🔥' },
  { value: '天使', label: '天使', icon: '👼' },
  { value: '悪魔', label: '悪魔', icon: '😈' },
  { value: '守護', label: '守護', icon: '🛡️' },
  { value: '破壊', label: '破壊', icon: '⚡' },
];

export function StyleSelector({
  rarity,
  onRarityChange,
  attribute,
  onAttributeChange,
}: StyleSelectorProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-white text-sm font-bold mb-3">
          レアリティ
        </label>
        <div className="grid grid-cols-3 gap-3">
          {RARITIES.map((r) => (
            <button
              key={r.value}
              onClick={() => onRarityChange(r.value)}
              className={`
                relative overflow-hidden rounded-lg p-4 transition-all
                ${rarity === r.value ? 'ring-2 ring-yellow-400 scale-105' : ''}
              `}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${r.color} opacity-80`} />
              <span className="relative text-white font-bold">{r.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-white text-sm font-bold mb-3">
          属性
        </label>
        <div className="grid grid-cols-3 gap-3">
          {ATTRIBUTES.map((attr) => (
            <button
              key={attr.value}
              onClick={() => onAttributeChange(attr.value)}
              className={`
                bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-3
                hover:bg-white/20 transition-all
                ${attribute === attr.value ? 'ring-2 ring-yellow-400 bg-white/20' : ''}
              `}
            >
              <div className="text-2xl mb-1">{attr.icon}</div>
              <div className="text-white text-sm">{attr.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
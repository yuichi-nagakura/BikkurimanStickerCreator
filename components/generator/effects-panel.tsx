'use client';

interface EffectsPanelProps {
  effects: {
    holographic: boolean;
    sparkle: boolean;
    aura: boolean;
  };
  onChange: (effects: any) => void;
}

export function EffectsPanel({ effects, onChange }: EffectsPanelProps) {
  const toggleEffect = (effect: string) => {
    onChange({
      ...effects,
      [effect]: !effects[effect as keyof typeof effects],
    });
  };

  return (
    <div className="space-y-4">
      <label className="block text-white text-sm font-bold mb-3">
        特殊効果
      </label>
      
      <div className="space-y-3">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={effects.holographic}
            onChange={() => toggleEffect('holographic')}
            className="w-5 h-5 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
          />
          <span className="text-white">ホログラフィック効果</span>
          <span className="text-white/50 text-sm">虹色の反射効果</span>
        </label>

        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={effects.sparkle}
            onChange={() => toggleEffect('sparkle')}
            className="w-5 h-5 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
          />
          <span className="text-white">キラキラ効果</span>
          <span className="text-white/50 text-sm">輝く粒子効果</span>
        </label>

        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={effects.aura}
            onChange={() => toggleEffect('aura')}
            className="w-5 h-5 rounded border-gray-300 text-yellow-400 focus:ring-yellow-400"
          />
          <span className="text-white">オーラ効果</span>
          <span className="text-white/50 text-sm">光るオーラ効果</span>
        </label>
      </div>
    </div>
  );
}
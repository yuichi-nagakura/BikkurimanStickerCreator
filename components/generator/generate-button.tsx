'use client';

interface GenerateButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export function GenerateButton({ onClick, isLoading, disabled }: GenerateButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        w-full py-4 px-8 rounded-full font-bold text-lg transition-all duration-200
        ${disabled || isLoading
          ? 'bg-gray-500 cursor-not-allowed opacity-50'
          : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:shadow-lg hover:scale-105'
        }
      `}
    >
      {isLoading ? (
        <div className="flex items-center justify-center space-x-2">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          <span>生成中...</span>
        </div>
      ) : (
        '画像を生成'
      )}
    </button>
  );
}
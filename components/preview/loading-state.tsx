export function LoadingState() {
  return (
    <div className="w-full aspect-square bg-white/5 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-ping" />
          <div className="relative bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full w-24 h-24 flex items-center justify-center">
            <span className="text-white text-4xl font-bold">B</span>
          </div>
        </div>
        <p className="text-white mb-2">画像を生成中...</p>
        <div className="flex items-center justify-center space-x-1">
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
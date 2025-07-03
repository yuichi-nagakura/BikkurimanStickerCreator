import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-white">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-bold title-gothic mb-4">
          <span className="gradient-text">ビックリマンメーカー</span>
        </h1>
        
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          AIの力で、あなただけのオリジナルビックリマンシール風画像を作成しよう！
          キャラクターの説明を入力するだけで、懐かしいホログラムシールが生成されます。
        </p>

        <div className="flex gap-4 justify-center mt-8">
          <Link
            href="/generate"
            className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full font-bold text-lg hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            画像を作成する
          </Link>
          
          <Link
            href="/history"
            className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full font-bold text-lg hover:bg-white/20 transition-all duration-200"
          >
            作成履歴を見る
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="text-3xl mb-4">✨</div>
            <h3 className="text-xl font-bold mb-2">簡単操作</h3>
            <p className="text-gray-300">キャラクターの説明を入力するだけで、AIが自動で画像を生成</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="text-3xl mb-4">🌈</div>
            <h3 className="text-xl font-bold mb-2">レアリティ選択</h3>
            <p className="text-gray-300">ノーマル、レア、スーパーレアから選べる3つのレアリティ</p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="text-3xl mb-4">💎</div>
            <h3 className="text-xl font-bold mb-2">特殊効果</h3>
            <p className="text-gray-300">ホログラフィック、キラキラ、オーラなどの効果を追加可能</p>
          </div>
        </div>
      </div>
    </div>
  )
}
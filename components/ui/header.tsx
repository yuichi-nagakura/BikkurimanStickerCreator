'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-black/30 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <nav className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="text-white text-xl font-bold title-gothic">
              ビックリマンメーカー
            </span>
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link 
              href="/generate" 
              className={`text-white hover:text-yellow-400 transition-colors ${
                pathname === '/generate' ? 'text-yellow-400' : ''
              }`}
            >
              作成
            </Link>
            <Link 
              href="/history" 
              className={`text-white hover:text-yellow-400 transition-colors ${
                pathname === '/history' ? 'text-yellow-400' : ''
              }`}
            >
              履歴
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
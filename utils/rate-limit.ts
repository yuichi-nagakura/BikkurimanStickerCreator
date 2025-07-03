// メモリベースのレート制限
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1分
  const maxRequests = 10;
  
  const requestData = requestCounts.get(ip);
  
  if (!requestData || now > requestData.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (requestData.count >= maxRequests) {
    return false;
  }
  
  requestData.count++;
  return true;
}

// 定期的に古いエントリをクリーンアップ
setInterval(() => {
  const now = Date.now();
  Array.from(requestCounts.entries()).forEach(([ip, data]) => {
    if (now > data.resetTime) {
      requestCounts.delete(ip);
    }
  });
}, 60 * 1000); // 1分ごと
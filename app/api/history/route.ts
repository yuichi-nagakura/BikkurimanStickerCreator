import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    
    // パラメータのバリデーション
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid limit. Must be between 1 and 100.' },
        { status: 400 }
      );
    }
    
    if (offset < 0) {
      return NextResponse.json(
        { error: 'Invalid offset. Must be 0 or greater.' },
        { status: 400 }
      );
    }
    
    const [history, total] = await Promise.all([
      prisma.generatedImage.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      }),
      prisma.generatedImage.count()
    ]);
    
    return NextResponse.json({
      history: history.map(item => ({
        generationId: item.id,
        imageUrl: item.imageUrl,
        prompt: item.prompt,
        timestamp: item.createdAt.toISOString(),
        title: item.title,
        characterName: item.characterName,
        rarity: item.rarity
      })),
      total,
      hasMore: offset + limit < total
    });
  } catch (error) {
    console.error('History error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
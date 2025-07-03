import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { openAIService } from '@/lib/openai';
import { imageStorageService } from '@/lib/storage';
import { generateRequestSchema } from '@/utils/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // バリデーション
    const validationResult = generateRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // 非同期処理の場合
    if (data.async) {
      const task = await prisma.task.create({
        data: {
          status: 'pending',
          data: JSON.stringify(data)
        }
      });

      // バックグラウンド処理を開始
      processImageGeneration(task.id, data).catch(error => {
        console.error('Background processing error:', error);
        prisma.task.update({
          where: { id: task.id },
          data: { 
            status: 'failed', 
            error: error.message 
          }
        });
      });

      return NextResponse.json({
        taskId: task.id,
        status: 'pending',
        message: '画像生成を開始しました'
      });
    }

    // 同期処理の場合
    try {
      // OpenAI APIで画像生成
      const openAIImageUrl = await openAIService.generateImage(data);
      
      // ローカルに保存
      const localImageUrl = await imageStorageService.saveImage(openAIImageUrl);
      
      // データベースに保存
      const generatedImage = await prisma.generatedImage.create({
        data: {
          imageUrl: localImageUrl,
          prompt: data.prompt,
          sourceImageUrl: data.sourceImage,
          title: data.title,
          characterName: data.characterName,
          attribute: data.attribute,
          rarity: data.rarity,
          backgroundColor: data.backgroundColor,
          effects: JSON.stringify(data.effects),
          style: JSON.stringify(data.style)
        }
      });

      // 統計を更新
      await updateUsageStats(true);

      return NextResponse.json({
        imageUrl: localImageUrl,
        generationId: generatedImage.id,
        timestamp: generatedImage.createdAt.toISOString()
      });
    } catch (error) {
      await updateUsageStats(false);
      throw error;
    }
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}

async function processImageGeneration(taskId: string, data: any) {
  try {
    // タスクを処理中に更新
    await prisma.task.update({
      where: { id: taskId },
      data: { 
        status: 'processing',
        progress: 10
      }
    });

    // OpenAI APIで画像生成
    const openAIImageUrl = await openAIService.generateImage(data);
    
    await prisma.task.update({
      where: { id: taskId },
      data: { progress: 50 }
    });

    // ローカルに保存
    const localImageUrl = await imageStorageService.saveImage(openAIImageUrl);
    
    await prisma.task.update({
      where: { id: taskId },
      data: { progress: 80 }
    });

    // データベースに保存
    const generatedImage = await prisma.generatedImage.create({
      data: {
        imageUrl: localImageUrl,
        prompt: data.prompt,
        sourceImageUrl: data.sourceImage,
        title: data.title,
        characterName: data.characterName,
        attribute: data.attribute,
        rarity: data.rarity,
        backgroundColor: data.backgroundColor,
        effects: JSON.stringify(data.effects),
        style: JSON.stringify(data.style)
      }
    });

    // タスクを完了に更新
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'completed',
        progress: 100,
        result: JSON.stringify({
          imageUrl: localImageUrl,
          generationId: generatedImage.id
        })
      }
    });

    await updateUsageStats(true);
  } catch (error: any) {
    await updateUsageStats(false);
    throw error;
  }
}

async function updateUsageStats(success: boolean) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.usageStats.upsert({
    where: { date: today },
    update: {
      imageCount: { increment: 1 },
      successCount: success ? { increment: 1 } : undefined,
      failureCount: !success ? { increment: 1 } : undefined
    },
    create: {
      date: today,
      imageCount: 1,
      successCount: success ? 1 : 0,
      failureCount: !success ? 1 : 0
    }
  });
}
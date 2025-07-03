import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      let attempts = 0;
      const maxAttempts = 120; // 2分間（1秒ごとに120回）

      const interval = setInterval(async () => {
        attempts++;

        try {
          const task = await prisma.task.findUnique({
            where: { id: params.taskId }
          });

          if (!task) {
            sendEvent({ error: 'Task not found' });
            clearInterval(interval);
            controller.close();
            return;
          }

          const eventData: any = {
            taskId: task.id,
            status: task.status,
            progress: task.progress || 0
          };

          if (task.result) {
            try {
              const result = JSON.parse(task.result);
              eventData.result = result;
            } catch (e) {
              console.error('Failed to parse task result:', e);
            }
          }

          if (task.error) {
            eventData.error = task.error;
          }

          sendEvent(eventData);

          // タスクが完了または失敗した場合、ストリームを終了
          if (task.status === 'completed' || task.status === 'failed') {
            clearInterval(interval);
            controller.close();
            return;
          }

          // タイムアウト
          if (attempts >= maxAttempts) {
            sendEvent({ error: 'Task timeout' });
            clearInterval(interval);
            controller.close();
          }
        } catch (error) {
          console.error('Stream error:', error);
          sendEvent({ error: 'Internal server error' });
          clearInterval(interval);
          controller.close();
        }
      }, 1000); // 1秒ごとに更新
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
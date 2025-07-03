'use client';

import { useState, useCallback } from 'react';
import type { GenerateRequest, GenerateResponse, TaskStatusResponse } from '@/types';

export function useImageGeneration() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<GenerateResponse | null>(null);

  const generateImage = useCallback(async (request: GenerateRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      // 非同期生成の場合
      if (request.async) {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          throw new Error('Failed to start generation');
        }

        const { taskId } = await response.json();

        // Server-Sent Eventsでタスクの進捗を監視
        const eventSource = new EventSource(`/api/tasks/${taskId}/stream`);

        eventSource.onmessage = (event) => {
          const data: TaskStatusResponse = JSON.parse(event.data);

          if (data.status === 'completed' && data.result) {
            setGeneratedImage({
              imageUrl: data.result.imageUrl,
              generationId: data.result.generationId,
              timestamp: new Date().toISOString(),
            });
            setIsLoading(false);
            eventSource.close();
          } else if (data.status === 'failed') {
            setError(data.error || 'Generation failed');
            setIsLoading(false);
            eventSource.close();
          }
        };

        eventSource.onerror = () => {
          setError('Connection lost');
          setIsLoading(false);
          eventSource.close();
        };
      } else {
        // 同期生成の場合
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(request),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to generate image');
        }

        const result: GenerateResponse = await response.json();
        setGeneratedImage(result);
        setIsLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsLoading(false);
    }
  }, []);

  return {
    generateImage,
    isLoading,
    error,
    generatedImage,
  };
}
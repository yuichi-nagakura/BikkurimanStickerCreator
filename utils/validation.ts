import { z } from 'zod';

export const generateRequestSchema = z.object({
  prompt: z.string().max(500).optional(),
  sourceImage: z.string().optional(),
  title: z.string().min(1).max(100),
  characterName: z.string().min(1).max(100),
  attribute: z.string().min(1).max(50),
  rarity: z.enum(['normal', 'rare', 'super-rare']),
  backgroundColor: z.string(),
  effects: z.object({
    holographic: z.boolean(),
    sparkle: z.boolean(),
    aura: z.boolean(),
  }),
  style: z.object({
    frameType: z.string(),
    frameColor: z.string(),
  }),
  async: z.boolean().optional(),
}).refine(
  (data) => data.prompt || data.sourceImage,
  {
    message: "Either prompt or sourceImage must be provided",
    path: ["prompt"],
  }
);

export type GenerateRequestValidated = z.infer<typeof generateRequestSchema>;
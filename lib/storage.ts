import { writeFile, unlink, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { existsSync } from 'fs';

export class ImageStorageService {
  private storageDir = join(process.cwd(), 'public', 'images');
  
  async ensureStorageDir() {
    if (!existsSync(this.storageDir)) {
      await mkdir(this.storageDir, { recursive: true });
    }
  }
  
  async saveImage(imageUrl: string): Promise<string> {
    await this.ensureStorageDir();
    
    // OpenAI APIから画像をダウンロード
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error('Failed to download image');
    }
    
    const buffer = await response.arrayBuffer();
    
    // ユニークなファイル名を生成
    const filename = `${uuidv4()}.png`;
    const filepath = join(this.storageDir, filename);
    
    // ファイルを保存
    await writeFile(filepath, Buffer.from(buffer));
    
    // 公開URLを返す
    return `/images/${filename}`;
  }
  
  async deleteImage(filename: string): Promise<void> {
    const filepath = join(this.storageDir, filename);
    try {
      await unlink(filepath);
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  }
}

export const imageStorageService = new ImageStorageService();
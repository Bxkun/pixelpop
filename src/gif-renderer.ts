import ffmpeg from 'fluent-ffmpeg';
import {createWriteStream, createReadStream} from 'node:fs';
import {unlink, mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {performance} from 'node:perf_hooks';

export interface GifRenderOptions {
  width?: string | number;
  height?: string | number;
  preserveAspectRatio?: boolean;
  maximumFrameRate?: number;
}

export interface GifAnimation {
  isPlaying: boolean;
}

// Frame buffer to preload frames
interface Frame {
  data: Uint8Array;
  index: number;
}

export async function renderGif(
  buffer: Readonly<Uint8Array>,
  onFrame: (frameData: Uint8Array) => Promise<void>,
  options: GifRenderOptions = {}
): Promise<GifAnimation> {
  // Configure fluent-ffmpeg to use the bundled binary
  const {default: ffmpegPath} = await import('ffmpeg-static');
  if (!ffmpegPath) {
    throw new Error('ffmpeg-static binary not found');
  }
  ffmpeg.setFfmpegPath(ffmpegPath as unknown as string);
  
  const {maximumFrameRate = 30} = options;
  
  const tempDir = await mkdtemp(join(tmpdir(), 'gif-frames-'));
  const inputPath = join(tempDir, 'input.gif');
  const outputPattern = join(tempDir, 'frame_%04d.png');
  
  // Write GIF buffer to temporary file
  const writeStream = createWriteStream(inputPath);
  writeStream.write(Buffer.from(buffer));
  writeStream.end();
  
  await new Promise<void>((resolve, reject) => {
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });
  
  const animation: GifAnimation = {isPlaying: true};
  
  // Extract frames using fluent-ffmpeg
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputOptions(['-vf', `fps=${maximumFrameRate}`, '-y'])
      .on('end', async () => {
        // Preload all frames into memory for smoother playback
        const frames: Frame[] = [];
        let frameIndex = 1;
        
        // Load all frames first
        while (true) {
          const framePath = join(tempDir, `frame_${frameIndex.toString().padStart(4, '0')}.png`);
          
          try {
            const frameData = await loadFrame(framePath);
            if (frameData) {
              frames.push({ data: frameData, index: frameIndex });
              frameIndex++;
            } else {
              break;
            }
          } catch {
            break;
          }
        }
        
        if (frames.length === 0) {
          reject(new Error('No frames extracted from GIF'));
          return;
        }
        
        // Use requestAnimationFrame-like timing for smooth playback
        const frameDelay = 1000 / maximumFrameRate;
        let currentFrameIndex = 0;
        let lastFrameTime = performance.now();
        
        const playAnimation = async () => {
          if (!animation.isPlaying) {
            await cleanup();
            return;
          }
          
          const currentTime = performance.now();
          const deltaTime = currentTime - lastFrameTime;
          
          // Only render if enough time has passed
          if (deltaTime >= frameDelay) {
            const frame = frames[currentFrameIndex];
            await onFrame(frame.data);
            
            currentFrameIndex = (currentFrameIndex + 1) % frames.length;
            lastFrameTime = currentTime - (deltaTime % frameDelay); // Account for timing drift
          }
          
          // Use setImmediate for smoother animation loop
          setImmediate(playAnimation);
        };
        
        const cleanup = async () => {
          try {
            const {readdir, rmdir} = await import('node:fs/promises');
            const files = await readdir(tempDir);
            await Promise.all(files.map(file => unlink(join(tempDir, file))));
            await rmdir(tempDir);
          } catch {}
        };
        
        // Start the animation
        playAnimation();
        resolve(animation);
      })
      .on('error', reject)
      .save(outputPattern);
  });
}

async function loadFrame(framePath: string): Promise<Uint8Array | null> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    const frameStream = createReadStream(framePath);
    
    frameStream.on('data', (chunk: string | Buffer) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    
    frameStream.on('end', () => {
      resolve(new Uint8Array(Buffer.concat(chunks)));
    });
    
    frameStream.on('error', () => {
      resolve(null);
    });
  });
}
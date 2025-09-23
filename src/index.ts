import process from 'node:process';
import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import chalk from 'chalk';
import {Jimp, intToRGBA} from 'jimp';
import {renderGif, type GifRenderOptions} from './gif-renderer.js';
import termImg from 'term-img';
import {imageDimensionsFromData} from 'image-dimensions';

const ROW_OFFSET = 2;
const PIXEL = '\u2584';

// Import terminal detection utilities
import { detectTerminal, type TerminalInfo } from './terminal-utils.js';

// Cache terminal info
let terminalInfo: TerminalInfo | null = null;
function getTerminalInfo(): TerminalInfo {
  if (!terminalInfo) {
    terminalInfo = detectTerminal();
  }
  return terminalInfo;
}

export type DimensionValue = number | `${number}%`;

export interface RenderOptions {
  readonly width?: DimensionValue;
  readonly height?: DimensionValue;
  readonly preserveAspectRatio?: boolean;
}

interface InternalRenderOptions extends RenderOptions {
  readonly isGifFrame?: boolean;
}

export type RenderFrame = ((text: string) => void) & {
  done?: () => void;
};

export interface GifOptions extends RenderOptions {
  readonly maximumFrameRate?: number;
  readonly renderFrame?: RenderFrame;
}

interface TerminalImage {
  buffer(buffer: Readonly<Uint8Array>, options?: RenderOptions): Promise<string>;
  file(filePath: string, options?: RenderOptions): Promise<string>;
  gifBuffer(buffer: Readonly<Uint8Array>, options?: GifOptions): Promise<() => void>;
  gifFile(filePath: string, options?: GifOptions): Promise<() => void>;
}

// Custom smooth frame renderer using cursor control
class SmoothRenderer {
  private currentFrame: string = '';
  private frameHeight: number = 0;
  
  render(frame: string): void {
    const lines = frame.split('\n');
    const newHeight = lines.length;
    
    // Move cursor to beginning
    process.stdout.write('\x1b[H');
    
    // If this is the first frame or height changed, clear screen
    if (this.frameHeight === 0 || this.frameHeight !== newHeight) {
      process.stdout.write('\x1b[2J\x1b[H');
      this.frameHeight = newHeight;
    } else {
      // Move cursor up to overwrite previous frame
      process.stdout.write(`\x1b[${newHeight}A`);
    }
    
    // Write the frame directly without clearing
    process.stdout.write(frame);
    
    // Clear any remaining lines from previous frame if it was taller
    if (this.frameHeight > newHeight) {
      for (let i = 0; i < this.frameHeight - newHeight; i++) {
        process.stdout.write('\x1b[K\n');
      }
    }
    
    this.currentFrame = frame;
  }
  
  done(): void {
    // Move cursor below the animation
    if (this.frameHeight > 0) {
      process.stdout.write(`\x1b[${this.frameHeight + 1}H`);
    }
    process.stdout.write('\n');
  }
}

function scale(width: number, height: number, originalWidth: number, originalHeight: number) {
  const originalRatio = originalWidth / originalHeight;
  const factor = width / height > originalRatio ? height / originalHeight : width / originalWidth;
  return {
    width: factor * originalWidth,
    height: factor * originalHeight
  };
}

function checkAndGetDimensionValue(value: DimensionValue, percentageBase: number) {
  if (typeof value === 'string' && value.endsWith('%')) {
    const percentageValue = Number.parseFloat(value);

    if (!Number.isNaN(percentageValue) && percentageValue > 0 && percentageValue <= 100) {
      return Math.floor((percentageValue / 100) * percentageBase);
    }
  }

  if (typeof value === 'number') {
    return value;
  }

  throw new Error(`${value} is not a valid dimension value`);
}

function calculateWidthHeight(
  imageWidth: number,
  imageHeight: number,
  inputWidth: DimensionValue | undefined,
  inputHeight: DimensionValue | undefined,
  preserveAspectRatio: boolean
) {
  const terminalColumns = process.stdout.columns ?? 80;
  const terminalRows = Math.max(1, (process.stdout.rows ?? 24) - ROW_OFFSET);

  let width: number;
  let height: number;

  if (inputHeight && inputWidth) {
    width = checkAndGetDimensionValue(inputWidth, terminalColumns);
    height = checkAndGetDimensionValue(inputHeight, terminalRows) * 2;

    if (preserveAspectRatio) {
      ({width, height} = scale(width, height, imageWidth, imageHeight));
    }
  } else if (inputWidth) {
    width = checkAndGetDimensionValue(inputWidth, terminalColumns);
    height = (imageHeight * width) / imageWidth;
  } else if (inputHeight) {
    height = checkAndGetDimensionValue(inputHeight, terminalRows) * 2;
    width = (imageWidth * height) / imageHeight;
  } else {
    ({width, height} = scale(terminalColumns, terminalRows * 2, imageWidth, imageHeight));
  }

  if (width > terminalColumns) {
    ({width, height} = scale(terminalColumns, terminalRows * 2, width, height));
  }

  return {
    width: Math.round(width),
    height: Math.round(height)
  };
}

async function renderAnsi(
  buffer: Readonly<Uint8Array>,
  {width: inputWidth, height: inputHeight, preserveAspectRatio}: RenderOptions
) {
  const image = await Jimp.read(Buffer.from(buffer));
  const {width, height} = calculateWidthHeight(
    image.bitmap.width,
    image.bitmap.height,
    inputWidth,
    inputHeight,
    preserveAspectRatio ?? true
  );

  image.resize({w: width, h: height});

  const termInfo = getTerminalInfo();
  const lines: string[] = [];
  
  for (let y = 0; y < image.bitmap.height - 1; y += 2) {
    let line = '';

    for (let x = 0; x < image.bitmap.width; x++) {
      const {r, g, b, a} = intToRGBA(image.getPixelColor(x, y));
      const {r: r2, g: g2, b: b2, a: a2} = intToRGBA(image.getPixelColor(x, y + 1));

      // Terminal-specific handling for transparency
      if (termInfo.useSpaceForTransparency && (a < 128 || a2 < 128)) {
        // For terminals that don't handle transparency well, use spaces
        line += ' ';
      } else if (a === 0 && a2 === 0) {
        // Both pixels transparent
        line += ' ';
      } else if (a === 0 || a < 50) {
        // Top pixel transparent or nearly transparent
        line += chalk.rgb(r2, g2, b2)('▀');
      } else if (a2 === 0 || a2 < 50) {
        // Bottom pixel transparent or nearly transparent
        line += chalk.rgb(r, g, b)('▄');
      } else {
        // Both pixels opaque - normal rendering
        // For some terminals, adjust the rendering approach
        if (termInfo.type === 'windows-terminal') {
          // Windows Terminal sometimes has issues with background colors
          line += chalk.bgRgb(r, g, b).rgb(r2, g2, b2)('▄');
        } else {
          line += chalk.bgRgb(r, g, b).rgb(r2, g2, b2)(PIXEL);
        }
      }
    }

    lines.push(line);
  }

  return lines.join('\n');
}

function drawImageWithKitty(buffer: Buffer, columns?: number, rows?: number) {
  const base64Data = buffer.toString('base64');
  const chunks: string[] = [];

  for (let index = 0; index < base64Data.length; index += 4096) {
    chunks.push(base64Data.slice(index, index + 4096));
  }

  let controlData = 'f=100,a=T';

  if (columns && columns > 0) {
    controlData += `,c=${Math.round(columns)}`;
  }

  if (rows && rows > 0) {
    controlData += `,r=${Math.round(rows)}`;
  }

  for (let index = 0; index < chunks.length; index++) {
    const chunk = chunks[index];
    const isLast = index === chunks.length - 1;

    if (index === 0) {
      process.stdout.write(`\u001B_G${controlData},m=${isLast ? 0 : 1};${chunk}\u001B\\`);
    } else {
      process.stdout.write(`\u001B_Gm=${isLast ? 0 : 1};${chunk}\u001B\\`);
    }
  }
}

async function renderKitty(
  buffer: Readonly<Uint8Array>,
  {width: inputWidth, height: inputHeight, preserveAspectRatio}: RenderOptions
) {
  const terminalColumns = (process.stdout.columns ?? 80) - 2;
  const terminalRows = Math.max(1, (process.stdout.rows ?? 24) - 4);

  let columns: number;
  let rows: number;

  if (typeof inputWidth === 'string' && inputWidth.endsWith('%')) {
    const percentage = Number.parseFloat(inputWidth) / 100;
    columns = Math.floor(terminalColumns * percentage);
  } else if (typeof inputWidth === 'number') {
    columns = Math.min(inputWidth, terminalColumns);
  } else {
    columns = terminalColumns;
  }

  if (typeof inputHeight === 'string' && inputHeight.endsWith('%')) {
    const percentage = Number.parseFloat(inputHeight) / 100;
    rows = Math.floor(terminalRows * percentage);
  } else if (typeof inputHeight === 'number') {
    rows = Math.min(inputHeight, terminalRows);
  } else if (preserveAspectRatio) {
    rows = terminalRows;
  } else {
    rows = terminalRows;
  }

  let imageBuffer = Buffer.from(buffer);
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;

  if (!isPng) {
    const image = await Jimp.read(Buffer.from(buffer));
    imageBuffer = Buffer.from(await image.getBuffer('image/png'));
  }

  if (preserveAspectRatio) {
    const dimensions = imageDimensionsFromData(buffer);

    if (dimensions?.width && dimensions?.height) {
      const imageAspectRatio = dimensions.width / dimensions.height;
      const cellAspectRatio = 0.5;
      const terminalAspectRatio = (columns * cellAspectRatio) / rows;

      if (imageAspectRatio > terminalAspectRatio) {
        drawImageWithKitty(imageBuffer, columns, undefined);
      } else {
        drawImageWithKitty(imageBuffer, undefined, rows);
      }
    } else {
      drawImageWithKitty(imageBuffer, columns, undefined);
    }
  } else {
    drawImageWithKitty(imageBuffer, columns, rows);
  }

  return '';
}

async function renderBuffer(buffer: Readonly<Uint8Array>, options: InternalRenderOptions = {}) {
  const {width = '100%', height = '100%', preserveAspectRatio = true, isGifFrame = false} = options;

  if (!isGifFrame && process.stdout.isTTY) {
    const termInfo = getTerminalInfo();
    
    // Use terminal-specific rendering
    if (termInfo.type === 'iterm') {
      // iTerm has native support - let term-img handle it
      const fallback = () => renderAnsi(buffer, {width, height, preserveAspectRatio});
      const rendered = termImg(buffer, {
        width,
        height,
        fallback
      });
      
      if (typeof rendered === 'string') {
        return rendered;
      }
      
      return fallback();
    } else if (termInfo.type === 'kitty' || termInfo.type === 'wezterm' || termInfo.type === 'konsole') {
      // Use Kitty protocol for these terminals
      try {
        return await renderKitty(buffer, {width, height, preserveAspectRatio});
      } catch {
        return renderAnsi(buffer, {width, height, preserveAspectRatio});
      }
    }
  }

  // Default to ANSI rendering
  return renderAnsi(buffer, {width, height, preserveAspectRatio});
}

const terminalImage: TerminalImage = {
  async buffer(buffer, options) {
    return renderBuffer(buffer, options);
  },

  async file(filePath, options) {
    const data = await fsPromises.readFile(filePath);
    return renderBuffer(data, options);
  },

  async gifBuffer(buffer, options = {}) {
    const smoothRenderer = new SmoothRenderer();
    
    const resolvedOptions: Required<Pick<GifOptions, 'renderFrame'>> & GifOptions = {
      maximumFrameRate: 30,
      preserveAspectRatio: true,
      renderFrame: ((text: string) => smoothRenderer.render(text)) as RenderFrame,
      ...options
    };

    // Override renderFrame.done if using smooth renderer
    if (!options.renderFrame) {
      resolvedOptions.renderFrame.done = () => smoothRenderer.done();
    }

    const finalize = () => {
      resolvedOptions.renderFrame.done?.();
    };

    const dimensions = imageDimensionsFromData(buffer);
    if ((dimensions?.width ?? 0) < 2 || (dimensions?.height ?? 0) < 2) {
      throw new Error('The image is too small to be rendered.');
    }

    const nativeResult = termImg(buffer, {
      width: resolvedOptions.width,
      height: resolvedOptions.height,
      fallback: () => false
    });

    if (nativeResult) {
      resolvedOptions.renderFrame(nativeResult);
      return finalize;
    }

    const renderFrame = resolvedOptions.renderFrame;
    const animationOptions: GifRenderOptions = {
      width: resolvedOptions.width,
      height: resolvedOptions.height,
      preserveAspectRatio: resolvedOptions.preserveAspectRatio,
      maximumFrameRate: resolvedOptions.maximumFrameRate
    };

    const animation = await renderGif(
      buffer,
      async frameData => {
        const frame = await renderBuffer(frameData, {
          width: resolvedOptions.width,
          height: resolvedOptions.height,
          preserveAspectRatio: resolvedOptions.preserveAspectRatio,
          isGifFrame: true
        });

        renderFrame(frame);
      },
      animationOptions
    );

    return () => {
      animation.isPlaying = false;
      finalize();
    };
  },

  async gifFile(filePath, options) {
    const data = fs.readFileSync(filePath);
    return this.gifBuffer(data, options);
  }
};

export default terminalImage;
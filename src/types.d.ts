declare module 'term-img' {
  export type TermDimensionValue = number | `${number}%`;

  export interface TermImgOptions {
    width?: TermDimensionValue;
    height?: TermDimensionValue;
    preserveAspectRatio?: boolean;
    fallback?: () => string | false | Promise<string | false>;
  }

  export default function termImg(
    buffer: Readonly<Uint8Array>,
    options?: TermImgOptions
  ): string | false;
}

declare module 'render-gif' {
  export type RenderGifDimensionValue = number | `${number}%`;

  export interface RenderGifOptions {
    width?: RenderGifDimensionValue;
    height?: RenderGifDimensionValue;
    preserveAspectRatio?: boolean;
    maximumFrameRate?: number;
  }

  export interface RenderGifAnimation {
    isPlaying: boolean;
  }

  export default function renderGif(
    buffer: Readonly<Uint8Array>,
    onFrame: (frameData: Readonly<Uint8Array>) => void | Promise<void>,
    options?: RenderGifOptions
  ): RenderGifAnimation;
}

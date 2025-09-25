declare module "term-img" {
  export type TermDimensionValue = number | `${number}%`;

  export interface TermImgOptions {
    width?: TermDimensionValue;
    height?: TermDimensionValue;
    preserveAspectRatio?: boolean;
    fallback?: () => string | false | Promise<string | false>;
  }

  export default function termImg(
    _buffer: Readonly<Uint8Array>,
    _options?: TermImgOptions,
  ): string | false;
}

declare module "render-gif" {
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
    _buffer: Readonly<Uint8Array>,
    _onFrame: (_frameData: Readonly<Uint8Array>) => void | Promise<void>,
    _options?: RenderGifOptions,
  ): RenderGifAnimation;
}

# 🎨 Pixelpop - Terminal Image & GIF Renderer

_Last Updated: December 19, 2024_

## 📋 Project Overview

**Pixelpop** is a sophisticated terminal utility library for displaying and animating images, GIFs, and photo sequences with ANSI color support. Built as an ES module library in TypeScript, it provides intelligent terminal detection and multiple rendering strategies to ensure cross-platform compatibility.

### 🔍 Project Details

- **Name**: @pinkpixel/pixelpop
- **Version**: 1.0.1
- **License**: Apache-2.0
- **Repository**: https://github.com/pinkpixel-dev/pixelpop
- **Node Requirement**: >= 20
- **Module Type**: ES Module (ESM)
- **Language**: TypeScript with ES2022 target

## ✨ Core Features

### 🖼️ Multi-Strategy Rendering

- **Native Terminal Support**: Leverages `term-img` for terminals with built-in image capabilities (iTerm2)
- **Kitty Protocol**: Direct image rendering for Kitty-compatible terminals (Kitty, WezTerm, Konsole)
- **ANSI Fallback**: Universal block character rendering with RGB colors using Chalk
- **Terminal Optimization**: Special handling for VS Code, Windows Terminal, and Alacritty
- **Smart Detection**: Automatic terminal capability detection via environment variables

### 🎬 Animation Capabilities

- **GIF Processing**: FFmpeg-based frame extraction with smooth playback
- **Frame Rate Control**: Configurable maximum frame rate (1-60 FPS)
- **Animation Control**: Start/stop functionality with automatic cleanup
- **Custom Rendering**: Support for custom frame rendering functions
- **Performance Optimization**: Intelligent frame buffering and timing
- **Memory Management**: Efficient temporary file handling and cleanup

### 📐 Dimension Management

- **Percentage-based Sizing**: Width/height can be specified as percentages
- **Aspect Ratio Preservation**: Intelligent scaling to maintain image proportions
- **Terminal Adaptation**: Automatic sizing based on terminal dimensions
- **Constraint Handling**: Prevents overflow beyond terminal boundaries

## 🏗️ Technical Architecture

### 📁 File Structure

```
pixelpop/
├── src/                     # TypeScript source code
│   ├── index.ts            # Main API and rendering logic
│   ├── gif-renderer.ts     # GIF animation handling
│   └── types.d.ts          # Type declarations for external modules
├── examples/               # Usage demonstrations
│   ├── example.ts          # Static image rendering
│   ├── gif.ts              # Animated GIF playbook
│   └── ffmpeg-static-example.ts # Direct FFmpeg usage
├── dist/                   # Compiled JavaScript output
├── package.json            # Project configuration
├── tsconfig.json           # TypeScript configuration
├── eslint.config.js        # ESLint rules
└── WARP.md                 # Development guidance
```

### 🎯 API Surface

The library exports a default object with four main methods:

#### Static Image Rendering

- `buffer(buffer: Uint8Array, options?: RenderOptions): Promise<string>`
- `file(filePath: string, options?: RenderOptions): Promise<string>`

#### Animated GIF Rendering

- `gifBuffer(buffer: Uint8Array, options?: GifOptions): Promise<() => void>`
- `gifFile(filePath: string, options?: GifOptions): Promise<() => void>`

#### Options Interface

```typescript
interface RenderOptions {
  readonly width?: DimensionValue; // number | `${number}%`
  readonly height?: DimensionValue; // number | `${number}%`
  readonly preserveAspectRatio?: boolean;
}

interface GifOptions extends RenderOptions {
  readonly maximumFrameRate?: number;
  readonly renderFrame?: RenderFrame;
}
```

## 🔧 Development Setup

### Build Commands

```bash
npm run build        # Compile TypeScript to dist/
npm run clean        # Remove dist directory
npm run prepare      # Auto-runs on install, builds project
```

### Code Quality

```bash
npm run lint         # Run ESLint
npm run lint:fix     # Run ESLint with auto-fix
npm run typecheck    # TypeScript validation without emit
```

### Testing Examples

```bash
node examples/example.js    # Static image rendering
node examples/gif.js        # Animated GIF with controls
```

## 📦 Dependencies

### Runtime Dependencies

- **chalk (^5.6.2)**: Terminal color and styling support
- **ffmpeg-static (^5.2.0)**: Bundled FFmpeg binary for GIF processing
- **fluent-ffmpeg (^2.1.3)**: High-level FFmpeg wrapper API
- **image-dimensions (^2.5.0)**: Fast image dimension detection
- **jimp (^1.6.0)**: Image processing and manipulation library
- **log-update (^7.0.0)**: Default frame renderer for animations
- **term-img (^7.0.0)**: Native terminal image support

### Development Dependencies

- **TypeScript (^5.9.2)**: Primary language with strict mode
- **ESLint (^9.36.0)**: Code linting with TypeScript integration
- **Prettier (^3.6.2)**: Code formatting
- **@types packages**: Type definitions for Node.js and fluent-ffmpeg

## 🚀 Usage Examples

### Basic Image Display

```typescript
import pixelPop from "@pinkpixel/pixelpop";

// Display image with percentage width
const output = await pixelPop.file("./image.jpg", { width: "60%" });
console.log(output);
```

### Animated GIF with Controls

```typescript
import pixelPop from "@pinkpixel/pixelpop";

// Start GIF animation with frame rate control
const stop = await pixelPop.gifFile("./animation.gif", {
  width: "80%",
  maximumFrameRate: 24,
});

// Stop after 5 seconds
setTimeout(stop, 5000);
```

## ⚙️ Technical Implementation

### Terminal Detection Strategy

The library uses sophisticated environment variable detection:

```typescript
// Comprehensive terminal detection
if (env.TERM_PROGRAM === "iTerm.app") {
  type = "iterm";
} else if (env.TERM === "xterm-kitty" || env.KITTY_WINDOW_ID) {
  type = "kitty";
} else if (env.TERM_PROGRAM === "WezTerm") {
  type = "wezterm";
} else if (env.TERM_PROGRAM === "konsole" || env.KONSOLE_VERSION) {
  type = "konsole";
} else if (env.TERM_PROGRAM === "vscode") {
  type = "vscode";
} else if (env.WT_SESSION || env.WSLENV?.includes("WT_SESSION")) {
  type = "windows-terminal";
} else if (env.ALACRITTY_SOCKET) {
  type = "alacritty";
}
```

### Rendering Pipeline

1. **Terminal Detection**: Check environment variables and TTY status
2. **Image Processing**: Use Jimp for resizing and color extraction
3. **Strategy Selection**: Native → Kitty → ANSI fallback
4. **Dimension Calculation**: Handle percentages and aspect ratios
5. **Output Generation**: Render appropriate format for terminal

### GIF Animation Flow

1. **FFmpeg Setup**: Configure bundled binary path
2. **Frame Extraction**: Export frames to temporary PNG files
3. **Animation Loop**: Process frames with controlled timing
4. **Cleanup Management**: Remove temporary files on completion

## 🎨 Brand & Ownership

**Created by**: Pink Pixel  
**Email**: admin@pinkpixel.dev  
**Website**: https://pinkpixel.dev  
**Tagline**: "Dream it, Pixel it" ✨  
**Signature**: Made with ❤️ by Pink Pixel

## 📊 Project Status

- ✅ **Production Ready**: Version 1.0.1 indicates stable release
- ✅ **Well Tested**: Comprehensive examples and usage patterns
- ✅ **Actively Maintained**: Current dependencies and modern tooling
- ✅ **Cross-Platform**: Multiple terminal compatibility strategies
- ✅ **Type Safe**: Full TypeScript implementation with strict mode
- ✅ **Performance Optimized**: Intelligent fallbacks and efficient processing

---

_This overview was generated on December 19, 2024, based on comprehensive codebase analysis of Pixelpop v1.0.1_

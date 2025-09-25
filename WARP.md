# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Pixelpop is a terminal utility library for displaying and animating images, GIFs, and photo sequences with ANSI color support. It's an ES module library written in TypeScript that provides both static image rendering and animated GIF playback in terminal environments.

## Development Commands

### Building

```bash
npm run build        # Compile TypeScript to dist/
npm run clean        # Remove dist directory
```

### Code Quality

```bash
npm run lint         # Run ESLint
npm run lint:fix     # Run ESLint with auto-fix
npm run typecheck    # Run TypeScript compiler without emitting files
```

### Package Management

```bash
npm run prepare      # Runs automatically on npm install, builds the project
```

## Architecture Overview

### Core Components

The library is structured around three main rendering strategies:

1. **Native Terminal Support**: Uses `term-img` for terminals with native image support (iTerm2, etc.)
2. **Kitty Protocol**: Direct image rendering for Kitty-compatible terminals (WezTerm, Konsole, etc.)
3. **ANSI Fallback**: Block character rendering with RGB colors using chalk for universal compatibility

### Key Files

- `src/index.ts`: Main API and rendering logic with intelligent terminal detection
- `src/gif-renderer.ts`: FFmpeg-based GIF frame extraction and animation loop
- `src/types.d.ts`: TypeScript declarations for external modules

### Rendering Pipeline

The rendering process follows this flow:

1. **Terminal Detection**: Check environment variables and TTY status to determine capabilities
2. **Image Processing**: Use Jimp for image manipulation (resizing, color extraction)
3. **Output Strategy**: Select between native, Kitty protocol, or ANSI rendering
4. **Dimension Calculation**: Handle percentage-based sizing and aspect ratio preservation

### GIF Animation System

GIF rendering uses FFmpeg (via ffmpeg-static) to extract frames to temporary PNG files, then renders each frame in sequence with controlled timing. The animation loop supports:

- Frame rate limiting (maximumFrameRate option)
- Graceful cleanup of temporary files
- Playback control via returned stop function

### API Design

The library exports a default object with four main methods:

- `buffer()` / `file()`: Static image rendering
- `gifBuffer()` / `gifFile()`: Animated GIF rendering

All methods support consistent options for width, height, and aspect ratio preservation, with intelligent defaults based on terminal dimensions.

## Dependencies

### Runtime Dependencies

- **chalk**: Terminal color support
- **ffmpeg-static**: Bundled FFmpeg binary for GIF processing
- **fluent-ffmpeg**: FFmpeg wrapper API
- **jimp**: Image processing and manipulation
- **log-update**: Default frame renderer for animations
- **term-img**: Native terminal image support
- **image-dimensions**: Fast image dimension detection

### Development Dependencies

- **TypeScript**: Primary language with ES2022 target
- **ESLint**: Code linting with TypeScript support
- **Prettier**: Code formatting

## Build Configuration

- **TypeScript**: Configured for Node16 module resolution with strict mode
- **ESLint**: Uses recommended TypeScript rules with custom unused variable handling
- **Output**: ES modules only, distributed via `dist/` directory
- **Node Version**: Requires Node.js >= 20

## Testing Examples

The `examples/` directory contains usage demonstrations:

- `example.ts`: Basic static image rendering
- `example_gif.ts`: Animated GIF playbook with stop control
- `example_pixel.ts`: ANSI pixel rendering demo

Run examples with a TS runner like `tsx` or `ts-node`:

```bash
# After building the library (npm run build)
npx tsx examples/example.ts
npx tsx examples/example_gif.ts
```

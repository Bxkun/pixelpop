# 📝 Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.1/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- Documentation updated to use correct scoped package name `@pinkpixel/pixelpop` across README, OVERVIEW, and `/docs`.
- Clarified ESM-only usage and corrected example run instructions.

## [1.0.1] - 2024-12-19

### 🎉 Initial Release

The first stable release of Pixelpop - a sophisticated terminal utility library for displaying and animating images, GIFs, and photo sequences with ANSI color support.

### ✨ Features Added

#### 🖼️ Image Display
- **Multi-format support**: Display JPEG, PNG, GIF, and other common image formats
- **Buffer and file input**: Support for both file paths and in-memory buffers
- **Intelligent terminal detection**: Automatically detects and adapts to terminal capabilities
- **Multiple rendering strategies**: Native terminal support, Kitty protocol, and ANSI fallback

#### 🎬 GIF Animation
- **Smooth GIF playback**: FFmpeg-based frame extraction and controlled animation
- **Frame rate control**: Configurable maximum frame rate limiting
- **Animation lifecycle**: Start/stop functionality with automatic cleanup
- **Custom rendering**: Support for custom frame rendering functions

#### 📐 Dimension Management
- **Flexible sizing**: Support for pixel dimensions and percentage-based sizing
- **Aspect ratio preservation**: Intelligent scaling to maintain image proportions
- **Terminal adaptation**: Automatic sizing based on terminal dimensions
- **Overflow prevention**: Smart constraints to prevent terminal overflow

#### 🎯 Terminal Compatibility
- **iTerm2**: Native image protocol support for highest quality
- **Kitty Protocol**: Direct rendering for Kitty, WezTerm, and Konsole terminals
- **VS Code Terminal**: Optimized ANSI rendering for integrated development environments
- **Windows Terminal**: Enhanced support with transparency handling
- **Alacritty**: GPU-accelerated terminal support with optimized rendering
- **Universal fallback**: ANSI block character rendering with RGB colors for all terminals
- **Smart detection**: Automatic terminal detection via environment variables

#### 🔧 Developer Experience
- **TypeScript first**: Full TypeScript implementation with comprehensive type definitions
- **ES Module**: Modern ES module architecture with Node.js 20+ support
- **Simple API**: Four main methods covering all use cases
- **Comprehensive documentation**: Complete guides, API reference, and examples
- **Terminal detection**: Intelligent terminal capability detection and optimization
- **Custom rendering**: Support for custom frame rendering functions
- **Performance optimization**: Frame rate control and memory management

### 🏗️ Technical Implementation

#### Dependencies
- **Runtime Dependencies**:
  - `chalk ^5.6.2`: Terminal color and styling support
  - `ffmpeg-static ^5.2.0`: Bundled FFmpeg binary for GIF processing
  - `fluent-ffmpeg ^2.1.3`: High-level FFmpeg wrapper API
  - `image-dimensions ^2.5.0`: Fast image dimension detection
  - `jimp ^1.6.0`: Image processing and manipulation
  - `log-update ^7.0.0`: Default frame renderer for animations
  - `term-img ^7.0.0`: Native terminal image support

#### Build System
- **TypeScript 5.9.2**: Strict mode compilation with ES2022 target
- **ESLint 9.36.0**: Code linting with TypeScript integration
- **Prettier 3.6.2**: Consistent code formatting
- **Node16 module resolution**: Modern module system support

#### API Surface
- `pixelPop.file(filePath, options?)`: Display image from file path
- `pixelPop.buffer(buffer, options?)`: Display image from buffer
- `pixelPop.gifFile(filePath, options?)`: Animate GIF from file path
- `pixelPop.gifBuffer(buffer, options?)`: Animate GIF from buffer

### 📚 Documentation
- **Comprehensive README**: Installation, usage, and quick start guide
- **API Reference**: Complete method documentation with TypeScript definitions
- **Getting Started Guide**: Step-by-step tutorial for new users
- **GIF Animation Guide**: Advanced animation techniques and optimization
- **Terminal Compatibility**: Terminal-specific optimizations and troubleshooting
- **Examples & Recipes**: Real-world usage patterns and integration examples
- **Centered branding**: Logo, badges, and demo GIFs in README

### 🎨 Branding
- Pink Pixel signature styling and theming
- Apache 2.0 license for open source compatibility
- Professional project structure and documentation

### 🔍 Quality Assurance
- TypeScript strict mode for type safety
- ESLint configuration for code quality
- Proper error handling and cleanup
- Cross-platform compatibility testing
- Multiple terminal environment validation

---

## 🚀 Future Releases

Future versions will include additional features, performance improvements, and expanded terminal compatibility. Stay tuned for updates!

---

*Made with ❤️ by Pink Pixel*  
*"Dream it, Pixel it" ✨*

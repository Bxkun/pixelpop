# 🎨 Terminal Compatibility Guide

Understanding how Pixelpop works across different terminals and optimizing for the best visual experience.

## 🎯 Overview

Pixelpop uses intelligent terminal detection to provide the best possible image rendering experience. This guide explains how different terminals are supported and how to optimize for each.

## 🏆 Rendering Strategies

### 1. Native Support (Premium Quality)

**How it works**: Uses terminal's built-in image rendering protocols

**Terminals**: iTerm2, Hyper, some custom terminals

**Quality**: ⭐⭐⭐⭐⭐ Excellent - pixel-perfect images

```typescript
// Automatically used when detected - no configuration needed
await pixelPop.file('./image.jpg', { width: '80%' });
```

**Environment Detection**:
```bash
TERM_PROGRAM=iTerm.app
# or
TERM_PROGRAM=Hyper
```

---

### 2. Kitty Protocol (High Quality)

**How it works**: Direct image rendering using Kitty graphics protocol

**Terminals**: Kitty, WezTerm, Konsole, some others

**Quality**: ⭐⭐⭐⭐⭐ Excellent - near pixel-perfect

```typescript
// Automatically detected and used
await pixelPop.file('./photo.png', { 
  width: '90%',
  preserveAspectRatio: true 
});
```

**Environment Detection**:
```bash
TERM=xterm-kitty
# or
KITTY_WINDOW_ID=123
# or  
TERM_PROGRAM=WezTerm
# or
TERM_PROGRAM=konsole
# or
KONSOLE_VERSION=21.12.3
```

---

### 3. ANSI Fallback (Universal)

**How it works**: Block character rendering with RGB colors

**Terminals**: Any terminal with ANSI color support (most terminals)

**Quality**: ⭐⭐⭐ Good - stylized block representation

```typescript
// Used automatically when native/Kitty aren't available
await pixelPop.file('./artwork.jpg', { 
  width: '70%' 
});
```

**Environment**: Works in virtually any modern terminal

---

## 📊 Terminal Compatibility Matrix

| Terminal | Strategy | macOS | Windows | Linux | Quality | Notes |
|----------|----------|-------|---------|--------|---------|--------|
| **iTerm2** | Native | ✅ | ❌ | ❌ | ⭐⭐⭐⭐⭐ | Best quality, macOS only |
| **Kitty** | Kitty Protocol | ✅ | ✅ | ✅ | ⭐⭐⭐⭐⭐ | Cross-platform, excellent |
| **WezTerm** | Kitty Protocol | ✅ | ✅ | ✅ | ⭐⭐⭐⭐⭐ | Modern, fast rendering |
| **Konsole** | Kitty Protocol | ❌ | ❌ | ✅ | ⭐⭐⭐⭐ | KDE default terminal |
| **VS Code Terminal** | ANSI Fallback | ✅ | ✅ | ✅ | ⭐⭐⭐ | Integrated terminal, optimized |
| **Windows Terminal** | ANSI Fallback | ❌ | ✅ | ✅ | ⭐⭐⭐ | Modern Windows terminal |
| **Alacritty** | ANSI Fallback | ✅ | ✅ | ✅ | ⭐⭐⭐ | Fast, GPU-accelerated |
| **Terminal.app** | ANSI Fallback | ✅ | ❌ | ❌ | ⭐⭐⭐ | macOS default |
| **GNOME Terminal** | ANSI Fallback | ❌ | ❌ | ✅ | ⭐⭐⭐ | Linux default |
| **xterm** | ANSI Fallback | ✅ | ✅ | ✅ | ⭐⭐ | Basic but universal |

---

## 🔍 Terminal Detection

### How Detection Works

Pixelpop checks these environment variables in order:

1. **`TERM_PROGRAM`** - Primary terminal identifier
2. **`TERM`** - Terminal type specification  
3. **`KITTY_WINDOW_ID`** - Kitty-specific identifier
4. **`KONSOLE_VERSION`** - Konsole version info

### Detection Code Example

```typescript
function detectTerminal() {
  const env = process.env;
  
  console.log('🔍 Terminal Detection Results:');
  console.log(`TERM_PROGRAM: ${env.TERM_PROGRAM}`);
  console.log(`TERM: ${env.TERM}`);
  console.log(`KITTY_WINDOW_ID: ${env.KITTY_WINDOW_ID}`);
  console.log(`KONSOLE_VERSION: ${env.KONSOLE_VERSION}`);
  
  // Determine strategy
  if (env.TERM_PROGRAM === 'iTerm.app') {
    console.log('✨ Strategy: Native Support (Premium)');
  } else if (
    env.TERM === 'xterm-kitty' ||
    env.KITTY_WINDOW_ID ||
    env.TERM_PROGRAM === 'WezTerm' ||
    env.TERM_PROGRAM === 'konsole' ||
    env.KONSOLE_VERSION
  ) {
    console.log('⚡ Strategy: Kitty Protocol (High Quality)');
  } else if (env.TERM_PROGRAM === 'vscode') {
    console.log('💻 Strategy: ANSI Fallback (VS Code Optimized)');
  } else if (env.WT_SESSION || env.WSLENV?.includes('WT_SESSION')) {
    console.log('💻 Strategy: ANSI Fallback (Windows Terminal)');
  } else if (env.ALACRITTY_SOCKET) {
    console.log('⚡ Strategy: ANSI Fallback (Alacritty)');
  } else {
    console.log('🌈 Strategy: ANSI Fallback (Universal)');
  }
}

// Run detection
detectTerminal();
```

---

## 🎯 Optimization by Terminal

### iTerm2 (macOS)

**Best practices**:
```typescript
// iTerm2 handles large images very well
await pixelPop.file('./high-res-photo.jpg', {
  width: '100%',    // Can use full terminal width
  height: '90%',    // Can use most of terminal height
  preserveAspectRatio: true
});

// Excellent GIF support
const stop = await pixelPop.gifFile('./complex-animation.gif', {
  width: '95%',
  maximumFrameRate: 60  // High frame rates work well
});
```

**Tips**:
- Supports transparency
- Handles very large images
- Excellent color reproduction
- Fast native rendering

---

### Kitty Terminal

**Best practices**:
```typescript
// Kitty has excellent performance
await pixelPop.file('./detailed-image.png', {
  width: '85%',
  preserveAspectRatio: true
});

// Great GIF performance
const stop = await pixelPop.gifFile('./smooth-anim.gif', {
  maximumFrameRate: 30  // Good balance
});
```

**Configuration tips**:
```bash
# In kitty.conf for optimal experience
enable_audio_bell no
visual_bell_duration 0.0
window_padding_width 4
```

---

### WezTerm

**Best practices**:
```typescript
// WezTerm handles medium to large images well
await pixelPop.file('./photo.jpg', {
  width: '75%',
  height: '80%',
  preserveAspectRatio: true
});

// Smooth animations
const stop = await pixelPop.gifFile('./loading.gif', {
  maximumFrameRate: 25
});
```

**Configuration optimization**:
```lua
-- In wezterm.lua
return {
  color_scheme = "Dracula",
  font_size = 12.0,
  enable_scroll_bar = false,
  -- Optimization for image rendering
  max_fps = 60,
}
```

---

### Standard Terminals (ANSI Fallback)

**Best practices**:
```typescript
// Use smaller sizes for better readability
await pixelPop.file('./image.jpg', {
  width: '60%',     // Smaller width for better blocks
  height: 40,       // Fixed height for consistency
  preserveAspectRatio: true
});

// Lower frame rates for better performance
const stop = await pixelPop.gifFile('./anim.gif', {
  width: '50%',
  maximumFrameRate: 15  // Easier on CPU
});
```

**Tips for ANSI rendering**:
- Smaller images often look better
- High contrast images work best  
- Simple graphics are more recognizable
- Lower frame rates reduce flicker

---

## 🚀 Performance Guidelines

### By Terminal Type

#### Native Support Terminals
```typescript
// Can handle larger images and higher frame rates
const options = {
  maxWidth: '100%',
  maxHeight: '90%', 
  maxFrameRate: 60,
  qualityLevel: 'maximum'
};
```

#### Kitty Protocol Terminals  
```typescript
// Excellent performance, moderate resource usage
const options = {
  maxWidth: '85%',
  maxHeight: '80%',
  maxFrameRate: 30,
  qualityLevel: 'high'
};
```

#### ANSI Fallback Terminals
```typescript
// Conservative settings for best compatibility
const options = {
  maxWidth: '60%', 
  maxHeight: 30,
  maxFrameRate: 15,
  qualityLevel: 'good'
};
```

### Adaptive Quality Example

```typescript
async function displayWithAdaptiveQuality(imagePath: string) {
  const env = process.env;
  let options;
  
  if (env.TERM_PROGRAM === 'iTerm.app') {
    // Native support - use maximum quality
    options = {
      width: '100%',
      maximumFrameRate: 60
    };
  } else if (
    env.TERM === 'xterm-kitty' ||
    env.KITTY_WINDOW_ID ||
    env.TERM_PROGRAM === 'WezTerm'
  ) {
    // Kitty protocol - high quality
    options = {
      width: '80%',
      maximumFrameRate: 30
    };
  } else {
    // ANSI fallback - optimized for readability
    options = {
      width: '60%',
      maximumFrameRate: 15
    };
  }
  
  if (imagePath.endsWith('.gif')) {
    return await pixelPop.gifFile(imagePath, options);
  } else {
    return await pixelPop.file(imagePath, options);
  }
}
```

---

## 🔧 Troubleshooting

### Common Issues by Terminal

#### iTerm2 Issues

**Problem**: Images not displaying
```typescript
// Check iTerm2 version and settings
console.log('iTerm2 Version Check:');
console.log('• Go to iTerm2 > About iTerm2');
console.log('• Ensure version 3.0+ for best support');
```

**Solution**: Update iTerm2 or check image file format

#### Kitty Terminal Issues

**Problem**: Pixelated or corrupted images
```bash
# Check Kitty version
kitty --version
# Should be 0.19.0 or newer for best results
```

**Problem**: Images not clearing properly
```typescript
// Manual cleanup in Kitty
process.stdout.write('\x1b_Ga=d\x1b\\');
```

#### ANSI Fallback Issues

**Problem**: Images look unrecognizable  
```typescript
// Try smaller dimensions
await pixelPop.file('./image.jpg', {
  width: 40,        // Very small width
  height: 20,       // Very small height
  preserveAspectRatio: true
});
```

**Problem**: Colors look wrong
```typescript
// Check terminal color support
console.log('Color depth:', process.stdout.hasColors(256) ? '256' : 'basic');
```

---

## 📏 Size Recommendations

### By Terminal Capability

| Terminal Type | Recommended Width | Recommended Height | Max Frame Rate |
|---------------|-------------------|-------------------|----------------|
| **Native** | 80%-100% | 70%-90% | 30-60 FPS |
| **Kitty Protocol** | 60%-80% | 50%-70% | 20-30 FPS |
| **ANSI Fallback** | 40%-60% | 20-40 rows | 10-20 FPS |

### Image Type Recommendations

#### Photos and Complex Images
```typescript
// Native/Kitty: Use original size, let terminal handle
await pixelPop.file('./photo.jpg', {
  width: '85%',
  preserveAspectRatio: true
});

// ANSI: Use smaller sizes for better recognition  
await pixelPop.file('./photo.jpg', {
  width: 50,
  height: 30,
  preserveAspectRatio: true
});
```

#### Icons and Simple Graphics
```typescript
// Work well at smaller sizes across all terminals
await pixelPop.file('./icon.png', {
  width: 20,
  height: 20,
  preserveAspectRatio: false  // Icons often benefit from exact sizing
});
```

#### GIF Animations
```typescript
// Adjust frame rate based on terminal capability
const frameRate = env.TERM_PROGRAM === 'iTerm.app' ? 30 : 
                  env.TERM === 'xterm-kitty' ? 24 : 15;

const stop = await pixelPop.gifFile('./anim.gif', {
  width: '60%',
  maximumFrameRate: frameRate
});
```

---

## 🧪 Testing Your Setup

### Terminal Capability Test

```typescript
async function testTerminalCapabilities() {
  console.log('🧪 Testing Terminal Capabilities\n');
  
  // Environment check
  const env = process.env;
  console.log('📋 Environment Variables:');
  console.log(`TERM: ${env.TERM}`);
  console.log(`TERM_PROGRAM: ${env.TERM_PROGRAM}`);
  console.log(`COLORTERM: ${env.COLORTERM}`);
  
  // Color support test
  console.log('\n🎨 Color Support:');
  console.log(`256 colors: ${process.stdout.hasColors(256)}`);
  console.log(`16M colors: ${process.stdout.hasColors(16777216)}`);
  
  // Size test
  console.log('\n📐 Terminal Dimensions:');
  console.log(`Columns: ${process.stdout.columns}`);
  console.log(`Rows: ${process.stdout.rows}`);
  
  // Try a simple test image
  try {
    console.log('\n🖼️  Testing Image Display...');
    // You would need a test image file for this
    // await pixelPop.file('./test-image.png', { width: '20%' });
    console.log('✅ Image display test would run here');
  } catch (error) {
    console.log('❌ Image display failed:', error.message);
  }
}

testTerminalCapabilities();
```

---

## 💡 Best Practices Summary

### Do's ✅

1. **Test across different terminals** during development
2. **Use adaptive sizing** based on terminal capabilities  
3. **Provide fallbacks** for older terminals
4. **Optimize frame rates** by terminal type
5. **Consider user's terminal preferences**

### Don'ts ❌

1. **Don't assume all terminals** support high-quality rendering
2. **Don't use huge images** in ANSI fallback mode
3. **Don't ignore terminal environment** variables
4. **Don't use excessive frame rates** without testing
5. **Don't forget about accessibility** in terminal applications

---

*Made with ❤️ by Pink Pixel*  
*"Dream it, Pixel it" ✨*
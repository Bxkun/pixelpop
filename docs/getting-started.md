# 📖 Getting Started with Pixelpop

Welcome to Pixelpop! This guide will help you get up and running with displaying beautiful images and animations in your terminal applications.

## 🚀 Installation

### Prerequisites

- **Node.js 20+** - Pixelpop requires a modern Node.js version
- **ESM-only package** - Use ESM in your project (or dynamic `import()` from CJS)
- **Terminal** - Any terminal that supports ANSI colors (most do!)

### Install Pixelpop

Choose your preferred package manager:

```bash
# NPM
npm install @pinkpixel/pixelpop

# Yarn
yarn add @pinkpixel/pixelpop

# PNPM
pnpm add @pinkpixel/pixelpop
```

## 🎯 Your First Image

Let's start with the simplest possible example:

```typescript
import pixelPop from '@pinkpixel/pixelpop';

// Display an image file
const output = await pixelPop.file('./my-image.jpg');
console.log(output);
```

That's it! Pixelpop will automatically:
- Detect your terminal's capabilities
- Choose the best rendering method
- Size the image to fit your terminal
- Display it with optimal quality

## 🎨 Basic Concepts

### Rendering Strategies

Pixelpop uses three different rendering strategies depending on your terminal:

1. **🏆 Native Support** (Best quality)
   - Works in: iTerm2, Hyper
   - Uses terminal's built-in image protocols

2. **⚡ Kitty Protocol** (High quality)
   - Works in: Kitty, WezTerm, Konsole
   - Direct image rendering with excellent quality

3. **🌈 ANSI Fallback** (Universal)
   - Works in: Any terminal with ANSI color support
   - Block character rendering with RGB colors

### Automatic Terminal Detection

Pixelpop automatically detects your terminal by checking environment variables:

```typescript
// These are checked automatically - no configuration needed!
process.env.TERM_PROGRAM    // 'iTerm.app', 'WezTerm', etc.
process.env.TERM           // 'xterm-kitty', etc.
process.env.KITTY_WINDOW_ID // Present in Kitty terminal
```

## 📐 Size Control

### Percentage-based Sizing

Perfect for responsive terminal applications:

```typescript
// Fill 80% of terminal width
await pixelPop.file('./image.jpg', { width: '80%' });

// Fill 50% of terminal height
await pixelPop.file('./image.jpg', { height: '50%' });

// Both dimensions
await pixelPop.file('./image.jpg', {
  width: '80%',
  height: '60%'
});
```

### Fixed Pixel Dimensions

For precise control:

```typescript
// Exact pixel dimensions
await pixelPop.file('./image.jpg', {
  width: 120,
  height: 80
});
```

### Aspect Ratio Control

```typescript
// Maintain original proportions (default)
await pixelPop.file('./image.jpg', {
  width: '80%',
  preserveAspectRatio: true  // default
});

// Stretch to fit exact dimensions
await pixelPop.file('./image.jpg', {
  width: 100,
  height: 100,
  preserveAspectRatio: false
});
```

## 🎬 Your First GIF Animation

Animated GIFs are just as easy:

```typescript
// Start animation
const stop = await pixelPop.gifFile('./animation.gif', {
  width: '60%'
});

// Stop after 5 seconds
setTimeout(stop, 5000);
```

### Frame Rate Control

Control animation smoothness and performance:

```typescript
// High-quality smooth animation
const stop = await pixelPop.gifFile('./smooth-animation.gif', {
  maximumFrameRate: 30  // Balanced quality and performance
});

// Battery-friendly animation
const stopSlow = await pixelPop.gifFile('./efficient-animation.gif', {
  maximumFrameRate: 15  // Lower CPU usage
});

// Ultra-smooth for high-end terminals
const stopUltra = await pixelPop.gifFile('./premium-animation.gif', {
  maximumFrameRate: 60  // Maximum smoothness (iTerm2, Kitty)
});
```

## 💾 Working with Buffers

Sometimes you have image data in memory instead of files:

```typescript
import { readFile } from 'fs/promises';

// Read image into buffer
const imageBuffer = await readFile('./photo.jpg');

// Display the buffer
await pixelPop.buffer(imageBuffer, {
  width: '50%'
});

// Same for GIFs
const gifBuffer = await readFile('./animation.gif');
const stop = await pixelPop.gifBuffer(gifBuffer, {
  maximumFrameRate: 24
});
```

## 🛠️ Common Patterns

### CLI Tool Integration

Perfect for command-line utilities:

```typescript
#!/usr/bin/env node
import pixelPop from '@pinkpixel/pixelpop';

const [,, imagePath] = process.argv;

if (!imagePath) {
  console.error('Usage: my-tool <image-path>');
  process.exit(1);
}

try {
  await pixelPop.file(imagePath, {
    width: '80%',
    preserveAspectRatio: true
  });
} catch (error) {
  console.error('Failed to display image:', error.message);
  process.exit(1);
}
```

### Progress Indicators

Use GIFs for loading animations:

```typescript
// Start loading animation
const stopLoading = await pixelPop.gifFile('./spinner.gif', {
  width: '10%'
});

// Do some work
await performLongOperation();

// Stop the loading animation
stopLoading();
console.log('✅ Operation complete!');
```

### Image Gallery

Display multiple images in sequence:

```typescript
const images = ['./photo1.jpg', './photo2.jpg', './photo3.jpg'];

for (const imagePath of images) {
  console.log(`\n📷 Showing: ${imagePath}`);
  await pixelPop.file(imagePath, { width: '80%' });
  
  // Wait for user input
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
    console.log('Press any key for next image...');
  });
}
```

## 🎯 Terminal-Specific Tips

### iTerm2 Users (macOS)
- ✨ **Best image quality** with native rendering
- 🖼️ **Supports largest images** without performance issues
- ⚙️ **No setup required** - works out of the box
- 🎬 **Excellent GIF support** with high frame rates

### Kitty/WezTerm/Konsole Users
- ⚡ **Excellent quality** with Kitty graphics protocol
- 🚀 **Fast rendering performance** across platforms
- 🌈 **Great transparency support** for PNG images
- 💻 **Cross-platform consistency**

### VS Code Terminal Users
- 💻 **Optimized ANSI rendering** for integrated terminal
- 🔧 **Special handling** for transparency and colors
- 📄 **Works well** with development workflows

### Windows Terminal Users
- 💻 **Modern Windows support** with good color reproduction
- ⚙️ **Optimized character rendering** for Windows fonts
- 🌈 **Decent color support** in ANSI mode

### Standard Terminal Users
- 🌈 **Universal ANSI fallback** works everywhere
- 📉 **Smaller images recommended** for better readability
- ⚡ **Lower frame rates** reduce terminal flicker

## 🚨 Error Handling

Always handle errors gracefully:

```typescript
async function displayImageSafely(path: string) {
  try {
    await pixelPop.file(path, { width: '80%' });
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`❌ Image not found: ${path}`);
    } else if (error.message.includes('too small')) {
      console.error('❌ Image is too small to render');
    } else {
      console.error('❌ Failed to display image:', error.message);
    }
  }
}
```

## 🎨 Custom Frame Rendering

For advanced GIF control:

```typescript
import logUpdate from 'log-update';

const customRenderer = (frame: string) => {
  // Custom frame display logic
  logUpdate(`🎬 Custom Animation:\n${frame}`);
};

customRenderer.done = () => {
  logUpdate.done();
  console.log('🎉 Animation finished!');
};

await pixelPop.gifFile('./animation.gif', {
  renderFrame: customRenderer,
  maximumFrameRate: 20
});
```

## 📊 Performance Tips

### For Better Performance

1. **Use appropriate image sizes** - Don't load huge images if you're displaying them small
2. **Control GIF frame rates** - Lower frame rates use less CPU
3. **Cache processed images** - If displaying the same image multiple times
4. **Use buffers efficiently** - Reuse buffers when possible

```typescript
// Good: Reasonable frame rate
await pixelPop.gifFile('./animation.gif', {
  maximumFrameRate: 24  // Smooth but not excessive
});

// Less optimal: Very high frame rate
await pixelPop.gifFile('./animation.gif', {
  maximumFrameRate: 120  // May be overkill and CPU-intensive
});
```

## 🔍 Debugging

### Check Your Terminal

Not sure what rendering method is being used? Check your environment:

```typescript
console.log('Terminal:', process.env.TERM_PROGRAM);
console.log('Term type:', process.env.TERM);
console.log('Kitty window:', process.env.KITTY_WINDOW_ID ? 'Yes' : 'No');
```

### Enable Debug Mode

For troubleshooting, you can add logging:

```typescript
try {
  console.log('Attempting to display image...');
  const output = await pixelPop.file('./test.jpg', {
    width: '50%'
  });
  console.log('Success! Output length:', output.length);
} catch (error) {
  console.error('Display failed:', error);
}
```

## 🚀 Next Steps

Now that you're comfortable with the basics:

1. **Explore the [API Reference](./api-reference.md)** for complete method documentation
2. **Check out [Examples & Recipes](./examples.md)** for more advanced patterns
3. **Read the [GIF Animation Guide](./gif-animation.md)** for animation techniques
4. **Learn about [Terminal Compatibility](./terminal-compatibility.md)** for optimal results

## 💡 Quick Reference

```typescript
// Static images
await pixelPop.file('./image.jpg', { width: '80%' });
await pixelPop.buffer(imageBuffer, { height: 40 });

// Animated GIFs
const stop = await pixelPop.gifFile('./anim.gif', { 
  width: '50%', 
  maximumFrameRate: 30 
});

// Clean up
setTimeout(stop, 10000);
```

Happy coding! 🎉

---

*Made with ❤️ by Pink Pixel*  
*"Dream it, Pixel it" ✨*

# 🎬 GIF Animation Guide

Master the art of terminal GIF animations with Pixelpop! This guide covers everything from basic playback to advanced animation control.

## 🎯 Table of Contents

- [Basic GIF Playback](#basic-gif-playback)
- [Animation Control](#animation-control)
- [Custom Frame Rendering](#custom-frame-rendering)
- [Performance Optimization](#performance-optimization)
- [Advanced Techniques](#advanced-techniques)
- [Troubleshooting](#troubleshooting)

---

## 🎮 Basic GIF Playback

### Simple Animation

The easiest way to play a GIF:

```typescript
import pixelPop from '@pinkpixel/pixelpop';

// Start playing a GIF
const stop = await pixelPop.gifFile('./animation.gif');

// Let it play for 10 seconds, then stop
setTimeout(stop, 10000);
```

### With Size Control

Control the animation size:

```typescript
const stop = await pixelPop.gifFile('./loading-spinner.gif', {
  width: '25%',        // 25% of terminal width
  height: 10,          // 10 terminal rows
  preserveAspectRatio: true
});
```

### Using Buffers

When working with GIF data in memory:

```typescript
import { readFile } from 'fs/promises';

const gifBuffer = await readFile('./animation.gif');
const stop = await pixelPop.gifBuffer(gifBuffer, {
  width: '50%'
});

// Don't forget to stop the animation
setTimeout(stop, 5000);
```

---

## ⚡ Animation Control

### Frame Rate Control

Optimize performance and visual quality:

```typescript
// Smooth, high-quality animation
const smoothStop = await pixelPop.gifFile('./smooth-anim.gif', {
  maximumFrameRate: 60
});

// Battery-friendly, lower CPU usage
const efficientStop = await pixelPop.gifFile('./efficient-anim.gif', {
  maximumFrameRate: 15
});

// Balanced approach
const balancedStop = await pixelPop.gifFile('./balanced-anim.gif', {
  maximumFrameRate: 24  // Cinema standard
});
```

### Immediate Stop Control

```typescript
const stop = await pixelPop.gifFile('./long-animation.gif');

// Stop immediately when user presses any key
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', () => {
  stop();
  console.log('\n🛑 Animation stopped by user');
  process.exit(0);
});
```

### Conditional Animation

```typescript
async function playConditionalGif() {
  let isPlaying = true;
  
  const stop = await pixelPop.gifFile('./conditional.gif', {
    width: '60%',
    maximumFrameRate: 30
  });

  // Stop based on some condition
  const checkCondition = setInterval(() => {
    if (someCondition()) {
      stop();
      clearInterval(checkCondition);
      console.log('🎯 Condition met, animation stopped');
    }
  }, 1000);
}
```

---

## 🎨 Custom Frame Rendering

### Basic Custom Renderer

Take full control of how frames are displayed:

```typescript
import chalk from 'chalk';

const customRenderer = (frame: string) => {
  // Clear the screen and add custom styling
  process.stdout.write('\x1Bc'); // Clear screen
  console.log(chalk.cyan('🎬 Custom Animation Player'));
  console.log(chalk.gray('─'.repeat(50)));
  console.log(frame);
  console.log(chalk.gray('─'.repeat(50)));
  console.log(chalk.yellow('Press Ctrl+C to stop'));
};

// Optional cleanup function
customRenderer.done = () => {
  console.log(chalk.green('\n✅ Animation completed successfully!'));
};

const stop = await pixelPop.gifFile('./demo.gif', {
  renderFrame: customRenderer,
  maximumFrameRate: 24
});
```

### Progress Indicator

Show animation progress:

```typescript
let frameCount = 0;
const startTime = Date.now();

const progressRenderer = (frame: string) => {
  frameCount++;
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  
  process.stdout.write('\x1Bc');
  console.log(`📊 Frame: ${frameCount} | Time: ${elapsed}s`);
  console.log('▶️  Animation:');
  console.log(frame);
};

progressRenderer.done = () => {
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n🏁 Completed! ${frameCount} frames in ${totalTime}s`);
};
```

### Multi-Animation Display

Display multiple GIFs with custom layout:

```typescript
const multiRenderer = (frame: string) => {
  process.stdout.write('\x1Bc');
  
  // Create a bordered display
  const lines = frame.split('\n');
  const maxWidth = Math.max(...lines.map(line => line.length));
  
  console.log('┌' + '─'.repeat(maxWidth + 2) + '┐');
  lines.forEach(line => {
    console.log('│ ' + line.padEnd(maxWidth) + ' │');
  });
  console.log('└' + '─'.repeat(maxWidth + 2) + '┘');
  console.log('\n🎭 Custom Animation Frame');
};

multiRenderer.done = () => {
  console.log('🎉 Multi-animation sequence complete!');
};
```

---

## 🚀 Performance Optimization

### Choosing Optimal Frame Rates

Different use cases require different frame rates:

```typescript
// Loading spinners - low frame rate is fine
const spinnerStop = await pixelPop.gifFile('./spinner.gif', {
  maximumFrameRate: 12,  // Smooth enough, low CPU
  width: '5%'
});

// Smooth animations - higher frame rate
const smoothStop = await pixelPop.gifFile('./smooth-transition.gif', {
  maximumFrameRate: 30,  // Smooth motion
  width: '80%'
});

// High-action content - maximum smoothness
const actionStop = await pixelPop.gifFile('./action-scene.gif', {
  maximumFrameRate: 60,  // Ultra smooth
  width: '100%'
});
```

### Memory Management

Handle large GIFs efficiently:

```typescript
async function playLargeGif(gifPath: string) {
  console.log('🔄 Loading large GIF...');
  
  try {
    const stop = await pixelPop.gifFile(gifPath, {
      width: '70%',
      maximumFrameRate: 24  // Reasonable frame rate
    });
    
    // Set up automatic cleanup
    const autoStop = setTimeout(() => {
      stop();
      console.log('🧹 Auto-stopped to prevent memory buildup');
    }, 30000); // Stop after 30 seconds
    
    // Manual stop clears auto-stop
    return () => {
      clearTimeout(autoStop);
      stop();
    };
  } catch (error) {
    console.error('❌ Failed to load large GIF:', error.message);
    throw error;
  }
}
```

### Batch Animation Processing

```typescript
async function playAnimationSequence(gifPaths: string[]) {
  for (let i = 0; i < gifPaths.length; i++) {
    console.log(`\n🎬 Playing animation ${i + 1}/${gifPaths.length}`);
    
    const stop = await pixelPop.gifFile(gifPaths[i], {
      width: '60%',
      maximumFrameRate: 20
    });
    
    // Play each for 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));
    stop();
    
    // Brief pause between animations
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('✅ Animation sequence complete!');
}

// Usage
await playAnimationSequence([
  './intro.gif',
  './main-content.gif',
  './outro.gif'
]);
```

---

## 🎭 Advanced Techniques

### Animation Synchronization

Sync multiple elements with GIF playback:

```typescript
class SynchronizedPlayer {
  private stopFunction?: () => void;
  private statusInterval?: NodeJS.Timeout;
  
  async play(gifPath: string) {
    // Start status updates
    let seconds = 0;
    this.statusInterval = setInterval(() => {
      seconds++;
      console.log(`⏱️  Playing for ${seconds} seconds...`);
    }, 1000);
    
    // Start animation
    this.stopFunction = await pixelPop.gifFile(gifPath, {
      width: '70%',
      maximumFrameRate: 25
    });
  }
  
  stop() {
    if (this.statusInterval) {
      clearInterval(this.statusInterval);
    }
    if (this.stopFunction) {
      this.stopFunction();
    }
    console.log('🛑 Synchronized playback stopped');
  }
}

// Usage
const player = new SynchronizedPlayer();
await player.play('./synced-animation.gif');

// Stop after 10 seconds
setTimeout(() => player.stop(), 10000);
```

### Interactive Animation Control

Let users control playback:

```typescript
class InteractiveGifPlayer {
  private stopFunction?: () => void;
  private isPaused = false;
  
  async play(gifPath: string) {
    console.log('🎮 Interactive GIF Player');
    console.log('Controls: [SPACE] = pause/resume, [Q] = quit');
    
    this.stopFunction = await pixelPop.gifFile(gifPath, {
      width: '80%',
      maximumFrameRate: 24
    });
    
    this.setupControls();
  }
  
  private setupControls() {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    process.stdin.on('data', (key: string) => {
      switch (key) {
        case ' ': // Space bar
          this.togglePause();
          break;
        case 'q':
        case '\u0003': // Ctrl+C
          this.quit();
          break;
      }
    });
  }
  
  private togglePause() {
    if (this.isPaused) {
      console.log('▶️  Resuming...');
      // Note: Pixelpop doesn't have built-in pause/resume
      // This is a conceptual example
    } else {
      console.log('⏸️  Pausing...');
    }
    this.isPaused = !this.isPaused;
  }
  
  private quit() {
    if (this.stopFunction) {
      this.stopFunction();
    }
    process.stdin.setRawMode(false);
    console.log('\n👋 Goodbye!');
    process.exit(0);
  }
}

// Usage
const interactivePlayer = new InteractiveGifPlayer();
await interactivePlayer.play('./interactive-demo.gif');
```

### Animation Chaining

Chain multiple animations in sequence:

```typescript
class AnimationChain {
  private animations: { path: string; duration: number; options?: any }[] = [];
  
  add(path: string, duration: number, options?: any) {
    this.animations.push({ path, duration, options });
    return this;
  }
  
  async play() {
    console.log(`🎬 Playing ${this.animations.length} animations in sequence`);
    
    for (let i = 0; i < this.animations.length; i++) {
      const { path, duration, options = {} } = this.animations[i];
      
      console.log(`\n▶️  Animation ${i + 1}: ${path}`);
      
      const stop = await pixelPop.gifFile(path, {
        width: '70%',
        maximumFrameRate: 24,
        ...options
      });
      
      await new Promise(resolve => setTimeout(resolve, duration));
      stop();
    }
    
    console.log('\n🎉 Animation chain complete!');
  }
}

// Usage
const chain = new AnimationChain()
  .add('./intro.gif', 3000, { width: '50%' })
  .add('./middle.gif', 5000, { width: '80%' })
  .add('./outro.gif', 2000, { width: '60%' });

await chain.play();
```

---

## 🔧 Troubleshooting

### Common Issues

#### GIF Won't Play

```typescript
async function debugGifPlayback(gifPath: string) {
  try {
    console.log('🔍 Debugging GIF playback...');
    
    // Check if file exists
    const fs = await import('fs/promises');
    await fs.access(gifPath);
    console.log('✅ File exists');
    
    // Check file size
    const stats = await fs.stat(gifPath);
    console.log(`📊 File size: ${(stats.size / 1024).toFixed(2)} KB`);
    
    // Try to play
    const stop = await pixelPop.gifFile(gifPath, {
      width: '50%',
      maximumFrameRate: 15
    });
    
    console.log('✅ GIF started successfully');
    
    setTimeout(() => {
      stop();
      console.log('✅ GIF stopped successfully');
    }, 3000);
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    
    if (error.code === 'ENOENT') {
      console.log('💡 Suggestion: Check the file path');
    } else if (error.message.includes('too small')) {
      console.log('💡 Suggestion: Try a larger size or different GIF');
    }
  }
}
```

#### Performance Issues

```typescript
async function optimizePerformance(gifPath: string) {
  console.log('⚡ Running performance optimization...');
  
  // Test different frame rates
  const frameRates = [10, 15, 20, 24, 30];
  
  for (const rate of frameRates) {
    console.log(`\n🧪 Testing ${rate} FPS...`);
    const startTime = Date.now();
    
    const stop = await pixelPop.gifFile(gifPath, {
      width: '40%',
      maximumFrameRate: rate
    });
    
    // Run for 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));
    stop();
    
    const duration = Date.now() - startTime;
    console.log(`⏱️  Completed in ${duration}ms`);
  }
}
```

#### Memory Monitoring

```typescript
function monitorMemoryUsage() {
  const formatBytes = (bytes: number) => (bytes / 1024 / 1024).toFixed(2) + ' MB';
  
  setInterval(() => {
    const usage = process.memoryUsage();
    console.log(`🧠 Memory - RSS: ${formatBytes(usage.rss)}, Heap: ${formatBytes(usage.heapUsed)}`);
  }, 5000);
}

// Start monitoring before playing large GIFs
monitorMemoryUsage();
```

---

## 🎯 Best Practices

### Do's ✅

1. **Always call the stop function** to prevent memory leaks
2. **Use appropriate frame rates** for different content types
3. **Handle errors gracefully** with try-catch blocks
4. **Test with different terminal sizes** and capabilities
5. **Monitor memory usage** for long-running animations

### Don'ts ❌

1. **Don't forget to stop animations** before process exit
2. **Don't use extremely high frame rates** unless necessary
3. **Don't ignore error handling** for production code
4. **Don't assume all terminals** support high-quality rendering
5. **Don't play multiple heavy animations** simultaneously

### Example Complete Animation Handler

```typescript
class SafeGifPlayer {
  private activeAnimations = new Set<() => void>();
  
  async play(gifPath: string, options: any = {}) {
    try {
      const stop = await pixelPop.gifFile(gifPath, {
        width: '70%',
        maximumFrameRate: 24,
        ...options
      });
      
      // Track active animation
      this.activeAnimations.add(stop);
      
      // Auto-cleanup after reasonable time
      const autoCleanup = setTimeout(() => {
        this.stopAnimation(stop);
      }, 60000); // 1 minute max
      
      // Return enhanced stop function
      return () => {
        clearTimeout(autoCleanup);
        this.stopAnimation(stop);
      };
      
    } catch (error) {
      console.error('Failed to play GIF:', error.message);
      throw error;
    }
  }
  
  private stopAnimation(stopFn: () => void) {
    if (this.activeAnimations.has(stopFn)) {
      stopFn();
      this.activeAnimations.delete(stopFn);
    }
  }
  
  stopAll() {
    console.log(`🛑 Stopping ${this.activeAnimations.size} active animations`);
    this.activeAnimations.forEach(stop => stop());
    this.activeAnimations.clear();
  }
}

// Usage
const player = new SafeGifPlayer();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🧹 Cleaning up animations...');
  player.stopAll();
  process.exit(0);
});
```

---

*Made with ❤️ by Pink Pixel*  
*"Dream it, Pixel it" ✨*
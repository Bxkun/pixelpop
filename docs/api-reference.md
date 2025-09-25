# 🎯 API Reference

Complete documentation for all Pixelpop methods, types, and interfaces.

## 📚 Table of Contents

- [Import Statement](#import-statement)
- [Static Image Methods](#static-image-methods)
- [Animated GIF Methods](#animated-gif-methods)
- [Types & Interfaces](#types--interfaces)
- [Error Handling](#error-handling)
- [Examples](#examples)

---

## Import Statement

```typescript
// ES Module (ESM-only package)
import pixelPop from "@pinkpixel/pixelpop";
```

Note: `@pinkpixel/pixelpop` is ESM-only (`package.json` has `"type": "module"`). Use ESM in your project, or use dynamic `import()` from CommonJS if needed.

---

## Static Image Methods

### `pixelPop.file(filePath, options?)`

Display an image from a file path.

#### Parameters

| Parameter  | Type            | Required | Description                   |
| ---------- | --------------- | -------- | ----------------------------- |
| `filePath` | `string`        | ✅       | Path to the image file        |
| `options`  | `RenderOptions` | ❌       | Display configuration options |

#### Returns

- **Type**: `Promise<string>`
- **Description**: Rendered image as a string (for ANSI fallback) or empty string (for native rendering)

#### Example

```typescript
const output = await pixelPop.file("./my-image.jpg", {
  width: "60%",
  height: 20,
  preserveAspectRatio: true,
});
console.log(output);
```

---

### `pixelPop.buffer(buffer, options?)`

Display an image from a buffer.

#### Parameters

| Parameter | Type                   | Required | Description                   |
| --------- | ---------------------- | -------- | ----------------------------- |
| `buffer`  | `Readonly<Uint8Array>` | ✅       | Image data as a buffer        |
| `options` | `RenderOptions`        | ❌       | Display configuration options |

#### Returns

- **Type**: `Promise<string>`
- **Description**: Rendered image as a string (for ANSI fallback) or empty string (for native rendering)

#### Example

```typescript
import { readFile } from "fs/promises";

const imageBuffer = await readFile("./screenshot.png");
const output = await pixelPop.buffer(imageBuffer, {
  width: 80,
  preserveAspectRatio: true,
});
console.log(output);
```

---

## Animated GIF Methods

### `pixelPop.gifFile(filePath, options?)`

Play an animated GIF from a file path.

#### Parameters

| Parameter  | Type         | Required | Description                     |
| ---------- | ------------ | -------- | ------------------------------- |
| `filePath` | `string`     | ✅       | Path to the GIF file            |
| `options`  | `GifOptions` | ❌       | Animation configuration options |

#### Returns

- **Type**: `Promise<() => void>`
- **Description**: Function to stop the animation

#### Example

```typescript
const stop = await pixelPop.gifFile("./loading.gif", {
  width: "50%",
  maximumFrameRate: 30,
});

// Stop animation after 5 seconds
setTimeout(stop, 5000);
```

---

### `pixelPop.gifBuffer(buffer, options?)`

Play an animated GIF from a buffer.

#### Parameters

| Parameter | Type                   | Required | Description                     |
| --------- | ---------------------- | -------- | ------------------------------- |
| `buffer`  | `Readonly<Uint8Array>` | ✅       | GIF data as a buffer            |
| `options` | `GifOptions`           | ❌       | Animation configuration options |

#### Returns

- **Type**: `Promise<() => void>`
- **Description**: Function to stop the animation

#### Example

```typescript
import { readFileSync } from "fs";

const gifBuffer = readFileSync("./animation.gif");
const stop = await pixelPop.gifBuffer(gifBuffer, {
  maximumFrameRate: 15,
  preserveAspectRatio: true,
});

// Animation will continue until stopped
```

---

## Types & Interfaces

### `RenderOptions`

Configuration options for static image rendering.

```typescript
interface RenderOptions {
  readonly width?: DimensionValue;
  readonly height?: DimensionValue;
  readonly preserveAspectRatio?: boolean;
}
```

#### Properties

| Property              | Type             | Default  | Description                         |
| --------------------- | ---------------- | -------- | ----------------------------------- |
| `width`               | `DimensionValue` | `'100%'` | Image width (pixels or percentage)  |
| `height`              | `DimensionValue` | `'100%'` | Image height (pixels or percentage) |
| `preserveAspectRatio` | `boolean`        | `true`   | Maintain original image proportions |

---

### `GifOptions`

Configuration options for animated GIF rendering.

```typescript
interface GifOptions extends RenderOptions {
  readonly maximumFrameRate?: number;
  readonly renderFrame?: RenderFrame;
}
```

#### Properties

| Property               | Type          | Default                  | Description                      |
| ---------------------- | ------------- | ------------------------ | -------------------------------- |
| `maximumFrameRate`     | `number`      | `30`                     | Maximum frames per second (1-60) |
| `renderFrame`          | `RenderFrame` | Built-in smooth renderer | Custom frame rendering function  |
| ...all `RenderOptions` |               |                          | Inherited from `RenderOptions`   |

---

### `DimensionValue`

Type for specifying image dimensions.

```typescript
type DimensionValue = number | `${number}%`;
```

#### Examples

```typescript
// Pixel values
const width: DimensionValue = 100;
const height: DimensionValue = 50;

// Percentage values
const responsiveWidth: DimensionValue = "80%";
const responsiveHeight: DimensionValue = "50%";
```

---

### `RenderFrame`

Type for custom frame rendering functions.

```typescript
type RenderFrame = ((text: string) => void) & {
  done?: () => void;
};
```

#### Properties

- **Function**: `(text: string) => void` - Called for each frame with rendered frame content
- **done** (optional): `() => void` - Called when animation completes or stops

#### Example

```typescript
const customRenderer: RenderFrame = (frame: string) => {
  // Clear screen and display frame
  process.stdout.write("\x1Bc");
  console.log("🎬 Custom Animation:");
  console.log(frame);
};

customRenderer.done = () => {
  console.log("\n✅ Animation finished!");
};
```

---

## Terminal Detection & Rendering

Pixelpop automatically detects your terminal's capabilities and chooses the optimal rendering strategy:

### Supported Terminals

| Terminal               | Strategy       | Quality    | Features                 |
| ---------------------- | -------------- | ---------- | ------------------------ |
| **iTerm2**             | Native         | ⭐⭐⭐⭐⭐ | Built-in image protocols |
| **Kitty**              | Kitty Protocol | ⭐⭐⭐⭐⭐ | Direct image rendering   |
| **WezTerm**            | Kitty Protocol | ⭐⭐⭐⭐⭐ | High-quality graphics    |
| **Konsole**            | Kitty Protocol | ⭐⭐⭐⭐   | KDE terminal support     |
| **VS Code**            | ANSI Fallback  | ⭐⭐⭐     | Integrated terminal      |
| **Windows Terminal**   | ANSI Fallback  | ⭐⭐⭐     | Modern Windows support   |
| **Alacritty**          | ANSI Fallback  | ⭐⭐⭐     | GPU-accelerated          |
| **Standard terminals** | ANSI Fallback  | ⭐⭐⭐     | Universal compatibility  |

### Detection Process

Pixelpop checks these environment variables:

```typescript
// Terminal detection (automatic)
process.env.TERM_PROGRAM; // 'iTerm.app', 'WezTerm', 'konsole'
process.env.TERM; // 'xterm-kitty'
process.env.KITTY_WINDOW_ID; // Present in Kitty
process.env.KONSOLE_VERSION; // Konsole version
process.env.WT_SESSION; // Windows Terminal
```

### Rendering Strategies

1. **Native Support** - Uses terminal's built-in image protocols (iTerm2)
2. **Kitty Protocol** - Direct image rendering for compatible terminals
3. **ANSI Fallback** - Block character rendering with RGB colors (universal)

---

## Error Handling

Pixelpop provides comprehensive error handling for various failure scenarios:

### Common Error Cases

#### File Not Found

```typescript
try {
  await pixelPop.file("./nonexistent.jpg");
} catch (error) {
  console.error("Image file not found:", error.message);
}
```

#### Invalid Buffer

```typescript
try {
  const invalidBuffer = new Uint8Array([1, 2, 3]);
  await pixelPop.buffer(invalidBuffer);
} catch (error) {
  console.error("Invalid image data:", error.message);
}
```

#### Dimension Validation

```typescript
try {
  await pixelPop.file("./image.jpg", {
    width: "invalid-dimension" as any,
  });
} catch (error) {
  console.error("Invalid dimension value:", error.message);
}
```

#### GIF Processing Errors

```typescript
try {
  await pixelPop.gifFile("./corrupted.gif");
} catch (error) {
  console.error("GIF processing failed:", error.message);
}
```

### Best Practices

1. **Always use try-catch** for async operations
2. **Validate file paths** before processing
3. **Check buffer validity** when using buffer methods
4. **Handle animation stop** gracefully

```typescript
// Robust error handling example
async function displayImageSafely(imagePath: string) {
  try {
    const output = await pixelPop.file(imagePath, {
      width: "80%",
      preserveAspectRatio: true,
    });
    console.log(output);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.error("Image file not found:", imagePath);
    } else if (error.message.includes("dimension")) {
      console.error("Invalid dimension specified");
    } else {
      console.error("Failed to display image:", error.message);
    }
  }
}
```

---

## Examples

### Basic Usage Patterns

#### Responsive Image Display

```typescript
// Adapt to terminal size
await pixelPop.file("./hero.jpg", {
  width: "100%",
  preserveAspectRatio: true,
});
```

#### Fixed Size Display

```typescript
// Specific pixel dimensions
await pixelPop.file("./icon.png", {
  width: 64,
  height: 64,
  preserveAspectRatio: false,
});
```

#### Buffer Processing Pipeline

```typescript
import { createReadStream } from "fs";

const stream = createReadStream("./image.jpg");
const chunks: Buffer[] = [];

stream.on("data", (chunk) => chunks.push(chunk));
stream.on("end", async () => {
  const buffer = Buffer.concat(chunks);
  await pixelPop.buffer(buffer, { width: "50%" });
});
```

### Advanced GIF Animation

#### Controlled Animation Loop

```typescript
let animationCount = 0;
const maxLoops = 3;

async function playGifWithLoopLimit() {
  const stop = await pixelPop.gifFile("./loop.gif", {
    width: "60%",
    maximumFrameRate: 24,
  });

  // Stop after specific number of loops
  const checkLoop = setInterval(() => {
    animationCount++;
    if (animationCount >= maxLoops) {
      stop();
      clearInterval(checkLoop);
      console.log("Animation completed!");
    }
  }, 2000); // Assuming 2 second loop duration
}
```

#### Custom Progress Indicator

```typescript
import chalk from "chalk";

const progressRenderer: RenderFrame = (frame: string) => {
  const timestamp = new Date().toLocaleTimeString();
  process.stdout.write(`\x1Bc`); // Clear screen
  console.log(chalk.blue(`🎬 Animation at ${timestamp}`));
  console.log(frame);
};

progressRenderer.done = () => {
  console.log(chalk.green("✅ Animation finished!"));
};

await pixelPop.gifFile("./demo.gif", {
  renderFrame: progressRenderer,
  maximumFrameRate: 20,
});
```

### Integration Examples

#### Express.js Server

```typescript
import express from "express";
import pixelPop from "@pinkpixel/pixelpop";

const app = express();

app.get("/image/:filename", async (req, res) => {
  try {
    const output = await pixelPop.file(`./images/${req.params.filename}`, {
      width: 80,
      preserveAspectRatio: true,
    });
    res.type("text/plain").send(output);
  } catch (error) {
    res.status(404).send("Image not found");
  }
});

app.listen(3000);
```

#### CLI Tool Integration

```typescript
#!/usr/bin/env node
import { program } from "commander";
import pixelPop from "@pinkpixel/pixelpop";

program
  .command("show <image>")
  .option("-w, --width <width>", "Image width", "80%")
  .option("-h, --height <height>", "Image height")
  .action(async (imagePath, options) => {
    try {
      await pixelPop.file(imagePath, {
        width: options.width,
        height: options.height,
        preserveAspectRatio: true,
      });
    } catch (error) {
      console.error("Error:", error.message);
      process.exit(1);
    }
  });

program.parse();
```

---

## 🔗 Related Documentation

- [Getting Started Guide](./getting-started.md)
- [GIF Animation Guide](./gif-animation.md)
- [Terminal Compatibility](./terminal-compatibility.md)
- [Examples & Recipes](./examples.md)

---

_Made with ❤️ by Pink Pixel_  
_"Dream it, Pixel it" ✨_

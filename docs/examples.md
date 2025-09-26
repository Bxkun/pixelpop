# 💡 Examples & Recipes

A collection of practical examples and code recipes for using Pixelpop in real-world applications.

## 🎯 Table of Contents

- [CLI Tools & Utilities](#cli-tools--utilities)
- [Web Applications](#web-applications)
- [Development Tools](#development-tools)
- [Creative Applications](#creative-applications)
- [System Integration](#system-integration)
- [Advanced Patterns](#advanced-patterns)

---

## 🛠️ CLI Tools & Utilities

### Image Viewer CLI

Create a simple image viewer command-line tool:

```typescript
#!/usr/bin/env node
import { program } from "commander";
import pixelPop from "@pinkpixel/pixelpop";
import { promises as fs } from "fs";
import path from "path";

program
  .name("imgview")
  .description("Terminal image viewer powered by Pixelpop")
  .version("1.0.1");

program
  .command("show <image>")
  .description("Display an image in the terminal")
  .option("-w, --width <width>", 'Image width (e.g., "80%" or 100)', "80%")
  .option("-h, --height <height>", 'Image height (e.g., "50%" or 40)')
  .option("--no-aspect", "Disable aspect ratio preservation")
  .action(async (imagePath: string, options: any) => {
    try {
      // Check if file exists
      await fs.access(imagePath);

      const displayOptions = {
        width: options.width,
        height: options.height,
        preserveAspectRatio: options.aspect,
      };

      console.log(`📷 Displaying: ${path.basename(imagePath)}`);
      await pixelPop.file(imagePath, displayOptions);
    } catch (error) {
      if (error.code === "ENOENT") {
        console.error(`❌ File not found: ${imagePath}`);
      } else {
        console.error(`❌ Error: ${error.message}`);
      }
      process.exit(1);
    }
  });

program
  .command("gif <animation>")
  .description("Play an animated GIF")
  .option("-w, --width <width>", "Animation width", "60%")
  .option("-f, --fps <fps>", "Maximum frame rate", "24")
  .option("-d, --duration <seconds>", "Duration in seconds", "10")
  .action(async (gifPath: string, options: any) => {
    try {
      console.log(`🎬 Playing: ${path.basename(gifPath)}`);
      console.log("Press Ctrl+C to stop");

      const stop = await pixelPop.gifFile(gifPath, {
        width: options.width,
        maximumFrameRate: parseInt(options.fps),
      });

      // Auto-stop after duration
      setTimeout(
        () => {
          stop();
          console.log("\n✅ Animation completed");
          process.exit(0);
        },
        parseInt(options.duration) * 1000,
      );

      // Handle Ctrl+C
      process.on("SIGINT", () => {
        stop();
        console.log("\n🛑 Animation stopped by user");
        process.exit(0);
      });
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  });

program.parse();
```

### Directory Image Browser

Browse images in a directory:

```typescript
#!/usr/bin/env node
import pixelPop from "@pinkpixel/pixelpop";
import { promises as fs } from "fs";
import path from "path";
import readline from "readline";

const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];

class ImageBrowser {
  private images: string[] = [];
  private currentIndex = 0;
  private rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  async loadImages(directory: string) {
    try {
      const files = await fs.readdir(directory);
      this.images = files
        .filter((file) => {
          const ext = path.extname(file).toLowerCase();
          return imageExtensions.includes(ext);
        })
        .map((file) => path.join(directory, file))
        .sort();

      console.log(`📁 Found ${this.images.length} images in ${directory}`);
      return this.images.length > 0;
    } catch (error) {
      console.error(`❌ Error reading directory: ${error.message}`);
      return false;
    }
  }

  async displayCurrentImage() {
    if (this.images.length === 0) return;

    const imagePath = this.images[this.currentIndex];
    const fileName = path.basename(imagePath);

    console.clear();
    console.log(
      `📷 Image ${this.currentIndex + 1}/${this.images.length}: ${fileName}`,
    );
    console.log("─".repeat(50));

    try {
      if (path.extname(imagePath).toLowerCase() === ".gif") {
        // For GIFs, show static version or play briefly
        await pixelPop.file(imagePath, { width: "70%" });
      } else {
        await pixelPop.file(imagePath, { width: "70%" });
      }
    } catch (error) {
      console.error(`❌ Failed to display ${fileName}: ${error.message}`);
    }

    console.log("─".repeat(50));
    console.log("Controls: [N]ext, [P]revious, [Q]uit, [G]if (if applicable)");
  }

  async showControls() {
    return new Promise<string>((resolve) => {
      this.rl.question("> ", (answer) => {
        resolve(answer.toLowerCase().trim());
      });
    });
  }

  async run(directory: string) {
    const hasImages = await this.loadImages(directory);
    if (!hasImages) {
      console.log("❌ No images found in directory");
      process.exit(1);
    }

    await this.displayCurrentImage();

    while (true) {
      const command = await this.showControls();

      switch (command) {
        case "n":
        case "next":
          this.currentIndex = (this.currentIndex + 1) % this.images.length;
          await this.displayCurrentImage();
          break;

        case "p":
        case "previous":
          this.currentIndex =
            this.currentIndex === 0
              ? this.images.length - 1
              : this.currentIndex - 1;
          await this.displayCurrentImage();
          break;

        case "g":
        case "gif":
          await this.playCurrentAsGif();
          break;

        case "q":
        case "quit":
          console.log("👋 Goodbye!");
          this.rl.close();
          process.exit(0);
          break;

        default:
          console.log(
            "❓ Unknown command. Use N(ext), P(revious), G(if), or Q(uit)",
          );
      }
    }
  }

  async playCurrentAsGif() {
    const imagePath = this.images[this.currentIndex];
    if (path.extname(imagePath).toLowerCase() !== ".gif") {
      console.log("📝 Current image is not a GIF");
      return;
    }

    console.log("🎬 Playing GIF... (Press any key to stop)");

    const stop = await pixelPop.gifFile(imagePath, {
      width: "70%",
      maximumFrameRate: 24,
    });

    process.stdin.setRawMode(true);
    process.stdin.once("data", () => {
      stop();
      process.stdin.setRawMode(false);
      console.log("\n🛑 GIF stopped");
      this.displayCurrentImage();
    });
  }
}

// Usage
const browser = new ImageBrowser();
const directory = process.argv[2] || ".";
browser.run(directory);
```

---

## 🌐 Web Applications

### Express.js Image Server

Serve terminal-rendered images via HTTP:

```typescript
import express from "express";
import pixelPop from "@pinkpixel/pixelpop";
import { promises as fs } from "fs";
import path from "path";
import multer from "multer";

const app = express();
const upload = multer({ dest: "uploads/" });

// Serve static images as terminal art
app.get("/image/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const { width = "80%", height, format = "ansi" } = req.query;

    const imagePath = path.join("./images", filename);
    await fs.access(imagePath);

    const output = await pixelPop.file(imagePath, {
      width: width as string,
      height: height ? parseInt(height as string) : undefined,
      preserveAspectRatio: true,
    });

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send(output);
  } catch (error) {
    res.status(404).json({
      error: "Image not found",
      message: error.message,
    });
  }
});

// Upload and convert images
app.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file provided" });
  }

  try {
    const { width = "60%", height } = req.body;

    const output = await pixelPop.file(req.file.path, {
      width,
      height: height ? parseInt(height) : undefined,
      preserveAspectRatio: true,
    });

    // Clean up uploaded file
    await fs.unlink(req.file.path);

    res.json({
      success: true,
      terminalArt: output,
      originalName: req.file.originalname,
      size: req.file.size,
    });
  } catch (error) {
    res.status(500).json({
      error: "Processing failed",
      message: error.message,
    });
  }
});

// GIF animation endpoint
app.get("/gif/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const gifPath = path.join("./gifs", filename);

    // For HTTP, we can't stream GIF frames, so return static version
    const output = await pixelPop.file(gifPath, {
      width: "60%",
      preserveAspectRatio: true,
    });

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.send(output);
  } catch (error) {
    res.status(404).json({
      error: "GIF not found",
      message: error.message,
    });
  }
});

app.listen(3000, () => {
  console.log("🌐 Terminal Art Server running on http://localhost:3000");
});
```

### WebSocket Live Image Streaming

Stream live terminal art via WebSocket:

```typescript
import WebSocket, { WebSocketServer } from "ws";
import pixelPop from "@pinkpixel/pixelpop";
import { promises as fs } from "fs";
import { watch } from "chokidar";

const wss = new WebSocketServer({ port: 8080 });

interface Client {
  ws: WebSocket;
  watchPath?: string;
  stopAnimation?: () => void;
}

const clients = new Set<Client>();

wss.on("connection", (ws) => {
  const client: Client = { ws };
  clients.add(client);

  console.log("📡 Client connected");

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message.toString());

      switch (data.type) {
        case "display-image":
          await handleDisplayImage(client, data);
          break;

        case "play-gif":
          await handlePlayGif(client, data);
          break;

        case "stop-gif":
          handleStopGif(client);
          break;

        case "watch-directory":
          await handleWatchDirectory(client, data);
          break;
      }
    } catch (error) {
      ws.send(
        JSON.stringify({
          type: "error",
          message: error.message,
        }),
      );
    }
  });

  ws.on("close", () => {
    handleStopGif(client);
    clients.delete(client);
    console.log("📡 Client disconnected");
  });
});

async function handleDisplayImage(client: Client, data: any) {
  const { path: imagePath, width = "70%", height } = data;

  try {
    await fs.access(imagePath);
    const output = await pixelPop.file(imagePath, {
      width,
      height,
      preserveAspectRatio: true,
    });

    client.ws.send(
      JSON.stringify({
        type: "image",
        content: output,
        path: imagePath,
      }),
    );
  } catch (error) {
    throw new Error(`Failed to display image: ${error.message}`);
  }
}

async function handlePlayGif(client: Client, data: any) {
  const { path: gifPath, width = "60%", fps = 24 } = data;

  // Stop any existing animation
  handleStopGif(client);

  const customRenderer = (frame: string) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(
        JSON.stringify({
          type: "gif-frame",
          content: frame,
          path: gifPath,
        }),
      );
    }
  };

  customRenderer.done = () => {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(
        JSON.stringify({
          type: "gif-complete",
          path: gifPath,
        }),
      );
    }
  };

  try {
    const stop = await pixelPop.gifFile(gifPath, {
      width,
      maximumFrameRate: fps,
      renderFrame: customRenderer,
    });

    client.stopAnimation = stop;
  } catch (error) {
    throw new Error(`Failed to play GIF: ${error.message}`);
  }
}

function handleStopGif(client: Client) {
  if (client.stopAnimation) {
    client.stopAnimation();
    client.stopAnimation = undefined;
  }
}

async function handleWatchDirectory(client: Client, data: any) {
  const { path: watchPath } = data;

  if (client.watchPath) {
    // Stop existing watcher
    // Implementation depends on your watcher setup
  }

  client.watchPath = watchPath;

  const watcher = watch(watchPath, {
    ignored: /^\.|node_modules/,
    persistent: true,
  });

  watcher.on("add", async (filePath) => {
    if (isImageFile(filePath)) {
      client.ws.send(
        JSON.stringify({
          type: "file-added",
          path: filePath,
        }),
      );
    }
  });
}

function isImageFile(filePath: string): boolean {
  const extensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp"];
  const ext = path.extname(filePath).toLowerCase();
  return extensions.includes(ext);
}

console.log("🚀 WebSocket server running on ws://localhost:8080");
```

---

## 🔧 Development Tools

### Git Commit Visualizer

Show visual diffs in terminal:

```typescript
import { execSync } from "child_process";
import pixelPop from "@pinkpixel/pixelpop";
import { promises as fs } from "fs";
import path from "path";
import chalk from "chalk";

class GitVisualizer {
  async showCommitImages(commitHash: string) {
    try {
      // Get list of changed files
      const changedFiles = execSync(
        `git diff-tree --no-commit-id --name-only -r ${commitHash}`,
        { encoding: "utf-8" },
      )
        .trim()
        .split("\n")
        .filter(Boolean);

      const imageFiles = changedFiles.filter((file) =>
        /\.(png|jpg|jpeg|gif|webp|bmp)$/i.test(file),
      );

      if (imageFiles.length === 0) {
        console.log("📝 No image files changed in this commit");
        return;
      }

      console.log(chalk.blue(`🎨 Visual diff for commit ${commitHash}`));
      console.log(chalk.gray("─".repeat(60)));

      for (const file of imageFiles) {
        await this.showFileDiff(file, commitHash);
      }
    } catch (error) {
      console.error("❌ Error:", error.message);
    }
  }

  async showFileDiff(filePath: string, commitHash: string) {
    console.log(`\n📄 ${chalk.yellow(filePath)}`);

    try {
      // Check if file exists in previous commit
      let prevExists = true;
      try {
        execSync(`git show ${commitHash}~1:${filePath}`, { stdio: "pipe" });
      } catch {
        prevExists = false;
      }

      if (prevExists) {
        // Show previous version
        console.log(chalk.red("\n🔴 Previous version:"));
        const prevBuffer = execSync(`git show ${commitHash}~1:${filePath}`);
        await pixelPop.buffer(new Uint8Array(prevBuffer), {
          width: "40%",
          preserveAspectRatio: true,
        });
      } else {
        console.log(chalk.green("\n✅ New file added"));
      }

      // Check if file exists in current commit
      let currentExists = true;
      try {
        execSync(`git show ${commitHash}:${filePath}`, { stdio: "pipe" });
      } catch {
        currentExists = false;
      }

      if (currentExists) {
        // Show current version
        console.log(chalk.green("\n🟢 Current version:"));
        const currentBuffer = execSync(`git show ${commitHash}:${filePath}`);
        await pixelPop.buffer(new Uint8Array(currentBuffer), {
          width: "40%",
          preserveAspectRatio: true,
        });
      } else {
        console.log(chalk.red("\n❌ File deleted"));
      }
    } catch (error) {
      console.error(`❌ Error processing ${filePath}:`, error.message);
    }
  }
}

// CLI usage
const visualizer = new GitVisualizer();
const commitHash = process.argv[2] || "HEAD";
visualizer.showCommitImages(commitHash);
```

### Test Result Visualizer

Show test results with visual indicators:

```typescript
import pixelPop from "@pinkpixel/pixelpop";
import { promises as fs } from "fs";
import chalk from "chalk";

interface TestResult {
  name: string;
  status: "pass" | "fail" | "skip";
  duration: number;
  error?: string;
}

class TestVisualizer {
  private readonly icons = {
    pass: "./assets/test-pass.gif",
    fail: "./assets/test-fail.gif",
    skip: "./assets/test-skip.gif",
  };

  async displayResults(results: TestResult[]) {
    console.log(chalk.blue("🧪 Test Results Visualizer\n"));

    const summary = this.getSummary(results);
    await this.showSummary(summary);

    console.log("\n📊 Individual Test Results:\n");

    for (const result of results) {
      await this.displayTestResult(result);
    }
  }

  private getSummary(results: TestResult[]) {
    return results.reduce(
      (acc, result) => {
        acc[result.status]++;
        acc.total++;
        acc.duration += result.duration;
        return acc;
      },
      { pass: 0, fail: 0, skip: 0, total: 0, duration: 0 },
    );
  }

  private async showSummary(summary: any) {
    const passRate = ((summary.pass / summary.total) * 100).toFixed(1);

    console.log(`📈 Summary: ${summary.total} tests in ${summary.duration}ms`);
    console.log(`✅ Passed: ${chalk.green(summary.pass)} (${passRate}%)`);
    console.log(`❌ Failed: ${chalk.red(summary.fail)}`);
    console.log(`⏭️  Skipped: ${chalk.yellow(summary.skip)}`);

    // Show overall status animation
    if (summary.fail === 0) {
      try {
        const stop = await pixelPop.gifFile(this.icons.pass, {
          width: "15%",
          maximumFrameRate: 20,
        });
        setTimeout(stop, 2000);
      } catch {
        console.log("🎉 All tests passed!");
      }
    } else {
      try {
        const stop = await pixelPop.gifFile(this.icons.fail, {
          width: "15%",
          maximumFrameRate: 20,
        });
        setTimeout(stop, 2000);
      } catch {
        console.log("💥 Some tests failed!");
      }
    }
  }

  private async displayTestResult(result: TestResult) {
    const statusIcon =
      result.status === "pass" ? "✅" : result.status === "fail" ? "❌" : "⏭️";
    const statusColor =
      result.status === "pass"
        ? "green"
        : result.status === "fail"
          ? "red"
          : "yellow";

    console.log(
      `${statusIcon} ${chalk[statusColor](result.name)} (${result.duration}ms)`,
    );

    if (result.status === "fail" && result.error) {
      console.log(chalk.red(`   Error: ${result.error}`));
    }

    // Show status-specific animation
    try {
      const stop = await pixelPop.gifFile(this.icons[result.status], {
        width: "8%",
        maximumFrameRate: 15,
      });
      setTimeout(stop, 1000);
    } catch {
      // Fallback to text-only display
    }

    console.log(); // Empty line for spacing
  }
}

// Example usage
const results: TestResult[] = [
  { name: "User authentication", status: "pass", duration: 150 },
  { name: "Database connection", status: "pass", duration: 89 },
  {
    name: "API endpoint validation",
    status: "fail",
    duration: 205,
    error: "Expected 200, got 500",
  },
  { name: "File upload handling", status: "skip", duration: 0 },
  { name: "Error handling", status: "pass", duration: 120 },
];

const visualizer = new TestVisualizer();
visualizer.displayResults(results);
```

---

## 🎨 Creative Applications

### ASCII Art Generator

Convert images to stylized ASCII art:

```typescript
import pixelPop from "@pinkpixel/pixelpop";
import { Jimp } from "jimp";
import chalk from "chalk";

class AsciiArtGenerator {
  private readonly chars = " .:-=+*#%@";

  async generateFromImage(
    imagePath: string,
    options: {
      width?: number;
      height?: number;
      colored?: boolean;
      inverted?: boolean;
    } = {},
  ) {
    try {
      const {
        width = 80,
        height = 40,
        colored = false,
        inverted = false,
      } = options;

      const image = await Jimp.read(imagePath);
      image.resize({ w: width, h: height });

      let result = "";

      for (let y = 0; y < image.bitmap.height; y++) {
        let line = "";

        for (let x = 0; x < image.bitmap.width; x++) {
          const pixel = image.getPixelColor(x, y);
          const { r, g, b, a } = Jimp.intToRGBA(pixel);

          // Calculate brightness
          const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
          const adjustedBrightness = inverted ? 1 - brightness : brightness;

          // Map to character
          const charIndex = Math.floor(
            adjustedBrightness * (this.chars.length - 1),
          );
          const char = this.chars[charIndex];

          if (colored && a > 0) {
            line += chalk.rgb(r, g, b)(char);
          } else {
            line += char;
          }
        }

        result += line + "\n";
      }

      return result;
    } catch (error) {
      throw new Error(`ASCII generation failed: ${error.message}`);
    }
  }

  async compareWithPixelpop(imagePath: string) {
    console.log("🎨 ASCII Art Comparison\n");

    // Show original Pixelpop output
    console.log(chalk.blue("📷 Pixelpop Output:"));
    await pixelPop.file(imagePath, {
      width: "40%",
      preserveAspectRatio: true,
    });

    console.log("\n" + chalk.green("🎭 ASCII Art Output:"));
    const ascii = await this.generateFromImage(imagePath, {
      width: 60,
      height: 30,
      colored: true,
    });
    console.log(ascii);

    console.log(chalk.yellow("🔗 Combined Display:"));
    console.log("Original | ASCII");
    console.log("─".repeat(40));

    // Side-by-side comparison would require more complex layout
  }
}

// Usage example
const generator = new AsciiArtGenerator();
const imagePath = process.argv[2];

if (imagePath) {
  generator.compareWithPixelpop(imagePath);
} else {
  console.log("Usage: node ascii-generator.js <image-path>");
}
```

### Terminal Art Gallery

Create an interactive art gallery:

```typescript
import pixelPop from "@pinkpixel/pixelpop";
import { promises as fs } from "fs";
import path from "path";
import chalk from "chalk";
import readline from "readline";

interface Artwork {
  path: string;
  title: string;
  artist: string;
  description: string;
  year?: number;
  isAnimated: boolean;
}

class ArtGallery {
  private artworks: Artwork[] = [];
  private currentIndex = 0;
  private rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  async loadGallery(galleryPath: string) {
    try {
      const metadataPath = path.join(galleryPath, "gallery.json");
      const metadata = JSON.parse(await fs.readFile(metadataPath, "utf-8"));

      this.artworks = metadata.artworks.map((artwork: any) => ({
        ...artwork,
        path: path.join(galleryPath, artwork.path),
      }));

      console.log(`🎨 Loaded ${this.artworks.length} artworks`);
      return true;
    } catch (error) {
      console.error("❌ Failed to load gallery:", error.message);
      return false;
    }
  }

  async displayCurrentArtwork() {
    const artwork = this.artworks[this.currentIndex];

    console.clear();

    // Gallery header
    console.log(chalk.magenta("🏛️  TERMINAL ART GALLERY"));
    console.log(chalk.gray("═".repeat(60)));

    // Artwork info
    console.log(`${chalk.cyan("Title:")} ${artwork.title}`);
    console.log(`${chalk.cyan("Artist:")} ${artwork.artist}`);
    if (artwork.year) {
      console.log(`${chalk.cyan("Year:")} ${artwork.year}`);
    }
    console.log(`${chalk.cyan("Description:")} ${artwork.description}`);
    console.log(chalk.gray("─".repeat(60)));

    // Display artwork
    try {
      if (artwork.isAnimated) {
        console.log(
          chalk.yellow("🎬 Animated artwork - press any key to stop"),
        );
        const stop = await pixelPop.gifFile(artwork.path, {
          width: "80%",
          maximumFrameRate: 24,
        });

        // Auto-stop after 10 seconds or user input
        const timeout = setTimeout(() => stop(), 10000);

        process.stdin.setRawMode(true);
        process.stdin.once("data", () => {
          clearTimeout(timeout);
          stop();
          process.stdin.setRawMode(false);
          this.showControls();
        });
      } else {
        await pixelPop.file(artwork.path, {
          width: "80%",
          preserveAspectRatio: true,
        });
        this.showControls();
      }
    } catch (error) {
      console.error(`❌ Error displaying artwork: ${error.message}`);
      this.showControls();
    }
  }

  private showControls() {
    console.log(chalk.gray("─".repeat(60)));
    console.log(`Artwork ${this.currentIndex + 1} of ${this.artworks.length}`);
    console.log("Controls: [N]ext, [P]revious, [R]eplay, [I]nfo, [Q]uit");

    this.rl.question("> ", (answer) => {
      this.handleCommand(answer.toLowerCase().trim());
    });
  }

  private async handleCommand(command: string) {
    switch (command) {
      case "n":
      case "next":
        this.currentIndex = (this.currentIndex + 1) % this.artworks.length;
        await this.displayCurrentArtwork();
        break;

      case "p":
      case "previous":
        this.currentIndex =
          this.currentIndex === 0
            ? this.artworks.length - 1
            : this.currentIndex - 1;
        await this.displayCurrentArtwork();
        break;

      case "r":
      case "replay":
        await this.displayCurrentArtwork();
        break;

      case "i":
      case "info":
        await this.showDetailedInfo();
        break;

      case "q":
      case "quit":
        console.log(chalk.green("👋 Thank you for visiting the gallery!"));
        this.rl.close();
        process.exit(0);
        break;

      default:
        console.log("❓ Unknown command");
        this.showControls();
    }
  }

  private async showDetailedInfo() {
    const artwork = this.artworks[this.currentIndex];

    console.log("\n" + chalk.blue("📋 Detailed Information:"));
    console.log("─".repeat(40));
    console.log(`Title: ${artwork.title}`);
    console.log(`Artist: ${artwork.artist}`);
    console.log(`Year: ${artwork.year || "Unknown"}`);
    console.log(`Type: ${artwork.isAnimated ? "Animated" : "Static"}`);
    console.log(`Description: ${artwork.description}`);

    try {
      const stats = await fs.stat(artwork.path);
      console.log(`File Size: ${(stats.size / 1024).toFixed(2)} KB`);
      console.log(`Format: ${path.extname(artwork.path).toUpperCase()}`);
    } catch (error) {
      console.log("File Info: Not available");
    }

    console.log("\nPress Enter to return to gallery...");
    this.rl.question("", () => {
      this.displayCurrentArtwork();
    });
  }

  async startTour() {
    if (this.artworks.length === 0) {
      console.log("❌ No artworks loaded");
      return;
    }

    console.log(chalk.green("🎨 Welcome to the Terminal Art Gallery!"));
    console.log("Preparing your virtual tour...\n");

    await new Promise((resolve) => setTimeout(resolve, 2000));
    await this.displayCurrentArtwork();
  }
}

// Example gallery.json structure
const exampleGallery = {
  name: "Digital Art Collection",
  description: "A curated collection of terminal-friendly digital artworks",
  artworks: [
    {
      path: "landscape.jpg",
      title: "Digital Sunset",
      artist: "Terminal Artist",
      description: "A beautiful sunset rendered in terminal colors",
      year: 2024,
      isAnimated: false,
    },
    {
      path: "animation.gif",
      title: "Code Rain",
      artist: "Matrix Creator",
      description: "Falling code animation in classic green",
      year: 2023,
      isAnimated: true,
    },
  ],
};

// Usage
const gallery = new ArtGallery();
const galleryPath = process.argv[2] || "./gallery";

gallery.loadGallery(galleryPath).then((success) => {
  if (success) {
    gallery.startTour();
  }
});
```

---

## ⚙️ System Integration

### System Monitor with Visuals

Monitor system resources with visual feedback:

```typescript
import pixelPop from "@pinkpixel/pixelpop";
import { promises as fs } from "fs";
import os from "os";
import chalk from "chalk";

class VisualSystemMonitor {
  private statusAnimations: { [key: string]: () => void } = {};

  async startMonitoring() {
    console.log(chalk.blue("📊 Visual System Monitor"));
    console.log("─".repeat(50));

    // Start monitoring loop
    setInterval(async () => {
      await this.updateDisplay();
    }, 2000);

    // Initial display
    await this.updateDisplay();
  }

  private async updateDisplay() {
    console.clear();
    console.log(
      chalk.blue("📊 System Status") + " - " + new Date().toLocaleTimeString(),
    );
    console.log("═".repeat(60));

    // CPU Usage
    const cpuUsage = await this.getCpuUsage();
    await this.displayMetric("CPU", cpuUsage, "cpu");

    // Memory Usage
    const memoryUsage = this.getMemoryUsage();
    await this.displayMetric("Memory", memoryUsage, "memory");

    // Disk Usage
    const diskUsage = await this.getDiskUsage();
    await this.displayMetric("Disk", diskUsage, "disk");

    // Network Activity (simulated)
    const networkUsage = Math.random() * 100;
    await this.displayMetric("Network", networkUsage, "network");
  }

  private async displayMetric(name: string, usage: number, type: string) {
    const color = usage > 80 ? "red" : usage > 60 ? "yellow" : "green";
    const status = usage > 80 ? "critical" : usage > 60 ? "warning" : "ok";

    console.log(`${chalk[color](`${name}:`)} ${usage.toFixed(1)}%`);

    // Show status animation
    try {
      const animationPath = `./assets/status-${status}.gif`;
      await fs.access(animationPath);

      // Stop any existing animation for this metric
      if (this.statusAnimations[type]) {
        this.statusAnimations[type]();
      }

      // Start new animation
      const stop = await pixelPop.gifFile(animationPath, {
        width: "15%",
        maximumFrameRate: 20,
      });

      this.statusAnimations[type] = stop;

      // Auto-stop after a short time
      setTimeout(() => {
        stop();
        delete this.statusAnimations[type];
      }, 1500);
    } catch {
      // Fallback to text-based indicator
      const bar = this.createTextBar(usage);
      console.log(`${bar} ${usage.toFixed(1)}%`);
    }

    console.log("─".repeat(30));
  }

  private createTextBar(percentage: number): string {
    const width = 20;
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;

    const color =
      percentage > 80 ? "red" : percentage > 60 ? "yellow" : "green";

    return chalk[color]("█".repeat(filled)) + chalk.gray("░".repeat(empty));
  }

  private async getCpuUsage(): Promise<number> {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    for (const cpu of cpus) {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    }

    return ((totalTick - totalIdle) / totalTick) * 100;
  }

  private getMemoryUsage(): number {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    return (used / total) * 100;
  }

  private async getDiskUsage(): Promise<number> {
    try {
      // Simplified disk usage calculation
      // In practice, you'd use a proper disk usage library
      return Math.random() * 100; // Placeholder
    } catch {
      return 0;
    }
  }
}

// Usage
const monitor = new VisualSystemMonitor();
monitor.startMonitoring();
```

---

## 🚀 Advanced Patterns

### Multi-threaded Image Processing

Process multiple images concurrently:

```typescript
import { Worker, isMainThread, parentPort, workerData } from "worker_threads";
import pixelPop from "@pinkpixel/pixelpop";
import { promises as fs } from "fs";
import path from "path";
import os from "os";

if (isMainThread) {
  // Main thread - coordinator
  class BatchImageProcessor {
    private workers: Worker[] = [];
    private readonly numWorkers = os.cpus().length;

    async processDirectory(directoryPath: string) {
      try {
        const files = await fs.readdir(directoryPath);
        const imageFiles = files
          .filter((file) => /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(file))
          .map((file) => path.join(directoryPath, file));

        console.log(
          `🔄 Processing ${imageFiles.length} images with ${this.numWorkers} workers`,
        );

        // Split files among workers
        const chunks = this.chunkArray(imageFiles, this.numWorkers);
        const promises = chunks.map((chunk, index) =>
          this.processChunk(chunk, index),
        );

        const results = await Promise.all(promises);
        const totalProcessed = results.reduce((sum, count) => sum + count, 0);

        console.log(`✅ Successfully processed ${totalProcessed} images`);
      } catch (error) {
        console.error("❌ Batch processing failed:", error.message);
      } finally {
        // Clean up workers
        this.workers.forEach((worker) => worker.terminate());
      }
    }

    private async processChunk(
      files: string[],
      workerIndex: number,
    ): Promise<number> {
      return new Promise((resolve, reject) => {
        const worker = new Worker(__filename, {
          workerData: { files, workerIndex },
        });

        this.workers.push(worker);

        worker.on("message", (message) => {
          if (message.type === "complete") {
            resolve(message.count);
          } else if (message.type === "progress") {
            console.log(`Worker ${workerIndex}: ${message.message}`);
          }
        });

        worker.on("error", reject);
      });
    }

    private chunkArray<T>(array: T[], chunkSize: number): T[][] {
      const chunks: T[][] = [];
      for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
      }
      return chunks;
    }
  }

  // Usage
  const processor = new BatchImageProcessor();
  const directory = process.argv[2] || "./images";
  processor.processDirectory(directory);
} else {
  // Worker thread - processes individual images
  async function processImages() {
    const { files, workerIndex } = workerData;
    let processedCount = 0;

    for (const filePath of files) {
      try {
        parentPort?.postMessage({
          type: "progress",
          message: `Processing ${path.basename(filePath)}`,
        });

        // Process the image (example: convert to terminal art)
        await pixelPop.file(filePath, {
          width: "50%",
          preserveAspectRatio: true,
        });

        processedCount++;

        // Simulate some processing time
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        parentPort?.postMessage({
          type: "progress",
          message: `Failed to process ${path.basename(filePath)}: ${error.message}`,
        });
      }
    }

    parentPort?.postMessage({
      type: "complete",
      count: processedCount,
    });
  }

  processImages();
}
```

### Real-time Image Stream Processor

Process live image streams:

```typescript
import pixelPop from "@pinkpixel/pixelpop";
import { Transform } from "stream";
import { createReadStream } from "fs";
import { EventEmitter } from "events";

class ImageStreamProcessor extends EventEmitter {
  private frameBuffer = Buffer.alloc(0);
  private expectedFrameSize = 0;
  private frameCount = 0;

  constructor(
    private options: {
      frameWidth: number;
      frameHeight: number;
      fps: number;
    },
  ) {
    super();
    this.expectedFrameSize = options.frameWidth * options.frameHeight * 3; // RGB
  }

  createTransform() {
    return new Transform({
      transform: (chunk: Buffer, encoding, callback) => {
        this.frameBuffer = Buffer.concat([this.frameBuffer, chunk]);

        // Process complete frames
        while (this.frameBuffer.length >= this.expectedFrameSize) {
          const frameData = this.frameBuffer.slice(0, this.expectedFrameSize);
          this.frameBuffer = this.frameBuffer.slice(this.expectedFrameSize);

          this.processFrame(frameData);
        }

        callback();
      },
    });
  }

  private async processFrame(frameData: Buffer) {
    try {
      // Convert raw RGB to displayable format
      const imageBuffer = this.rgbToImageBuffer(frameData);

      // Display using Pixelpop
      await pixelPop.buffer(imageBuffer, {
        width: "60%",
        preserveAspectRatio: true,
      });

      this.frameCount++;
      this.emit("frame", this.frameCount);

      // Control frame rate
      const delay = 1000 / this.options.fps;
      await new Promise((resolve) => setTimeout(resolve, delay));
    } catch (error) {
      this.emit("error", error);
    }
  }

  private rgbToImageBuffer(rgbData: Buffer): Uint8Array {
    // This is a simplified conversion
    // In practice, you'd need proper image encoding
    // For example, using Jimp to create a proper image buffer

    const { Jimp } = require("jimp");
    const image = new Jimp(this.options.frameWidth, this.options.frameHeight);

    for (let i = 0; i < rgbData.length; i += 3) {
      const r = rgbData[i];
      const g = rgbData[i + 1];
      const b = rgbData[i + 2];

      const pixelIndex = Math.floor(i / 3);
      const x = pixelIndex % this.options.frameWidth;
      const y = Math.floor(pixelIndex / this.options.frameWidth);

      const color = (r << 24) | (g << 16) | (b << 8) | 255; // RGBA
      image.setPixelColor(color, x, y);
    }

    return new Uint8Array(image.bitmap.data);
  }
}

// Usage example
async function processVideoStream() {
  const processor = new ImageStreamProcessor({
    frameWidth: 320,
    frameHeight: 240,
    fps: 15,
  });

  processor.on("frame", (frameNumber) => {
    console.log(`📺 Processed frame ${frameNumber}`);
  });

  processor.on("error", (error) => {
    console.error("❌ Stream processing error:", error);
  });

  // Simulate streaming data (in practice, this could come from a webcam, network stream, etc.)
  const mockStream = createReadStream("./mock-video-data.raw");
  const transformer = processor.createTransform();

  mockStream.pipe(transformer);

  console.log("🎥 Starting video stream processing...");
}

// processVideoStream();
```

---

_Made with ❤️ by Pink Pixel_  
_"Dream it, Pixel it" ✨_

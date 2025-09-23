// terminal-utils.ts
import process from 'node:process';
import chalk from 'chalk';

export interface TerminalInfo {
  type: 'kitty' | 'iterm' | 'wezterm' | 'konsole' | 'vscode' | 'windows-terminal' | 'alacritty' | 'standard';
  supportsTrueColor: boolean;
  supportsImages: boolean;
  supportsTransparency: boolean;
  useSpaceForTransparency: boolean;
}

export function detectTerminal(): TerminalInfo {
  const env = process.env;
  
  // Detect terminal type
  let type: TerminalInfo['type'] = 'standard';
  
  if (env.TERM_PROGRAM === 'iTerm.app') {
    type = 'iterm';
  } else if (env.TERM === 'xterm-kitty' || env.KITTY_WINDOW_ID) {
    type = 'kitty';
  } else if (env.TERM_PROGRAM === 'WezTerm') {
    type = 'wezterm';
  } else if (env.TERM_PROGRAM === 'konsole' || env.KONSOLE_VERSION) {
    type = 'konsole';
  } else if (env.TERM_PROGRAM === 'vscode') {
    type = 'vscode';
  } else if (env.WT_SESSION || env.WSLENV?.includes('WT_SESSION')) {
    type = 'windows-terminal';
  } else if (env.ALACRITTY_SOCKET) {
    type = 'alacritty';
  }
  
  // Determine capabilities
  const supportsTrueColor = 
    env.COLORTERM === 'truecolor' || 
    env.COLORTERM === '24bit' ||
    type !== 'standard';
    
  const supportsImages = 
    type === 'iterm' || 
    type === 'kitty' || 
    type === 'wezterm' || 
    type === 'konsole';
    
  // Some terminals handle transparency better than others
  const supportsTransparency = 
    type === 'kitty' || 
    type === 'iterm' || 
    type === 'wezterm' ||
    type === 'alacritty';
    
  // Windows Terminal and VSCode have issues with certain ANSI sequences
  const useSpaceForTransparency = 
    type === 'windows-terminal' || 
    type === 'vscode';
  
  return {
    type,
    supportsTrueColor,
    supportsImages,
    supportsTransparency,
    useSpaceForTransparency
  };
}

// Color optimization for terminals with limited color support
export function optimizeColor(r: number, g: number, b: number, terminalInfo: TerminalInfo): string {
  if (!terminalInfo.supportsTrueColor) {
    // Convert to 256 color mode for older terminals
    const r256 = Math.round(r / 255 * 5);
    const g256 = Math.round(g / 255 * 5);
    const b256 = Math.round(b / 255 * 5);
    const code = 16 + (36 * r256) + (6 * g256) + b256;
    return `\x1b[38;5;${code}m`;
  }
  
  return `\x1b[38;2;${r};${g};${b}m`;
}

// Get the best character for rendering based on terminal
export function getPixelCharacter(terminalInfo: TerminalInfo): string {
  // Some terminals render certain characters better
  switch (terminalInfo.type) {
    case 'windows-terminal':
      return '█'; // Full block works better in Windows Terminal
    case 'vscode':
      return '▄'; // Lower half block
    default:
      return '\u2584'; // Unicode lower half block (default)
  }
}
// Enhanced ANSI renderer with terminal-specific optimizations
export function renderAnsiOptimized(
  topR: number, topG: number, topB: number, topA: number,
  bottomR: number, bottomG: number, bottomB: number, bottomA: number,
  terminalInfo: TerminalInfo
): string {
  const pixel = getPixelCharacter(terminalInfo);
  
  // Handle transparency based on terminal capabilities
  if (topA === 0 && bottomA === 0) {
    return terminalInfo.useSpaceForTransparency ? ' ' : chalk.reset(' ');
  }
  
  if (topA === 0) {
    // Only render bottom pixel
    if (terminalInfo.supportsTransparency) {
      return chalk.rgb(bottomR, bottomG, bottomB)('▀');
    } else {
      return ' '; // Use space for terminals that don't handle transparency well
    }
  }
  
  if (bottomA === 0) {
    // Only render top pixel
    if (terminalInfo.supportsTransparency) {
      return chalk.rgb(topR, topG, topB)('▄');
    } else {
      return chalk.rgb(topR, topG, topB)(pixel);
    }
  }
  
  // Both pixels are opaque
  return chalk.bgRgb(topR, topG, topB).rgb(bottomR, bottomG, bottomB)(pixel);
}

export function shouldUseKittyProtocol(terminalInfo: TerminalInfo): boolean {
  return terminalInfo.type === 'kitty' || 
         terminalInfo.type === 'wezterm' || 
         terminalInfo.type === 'konsole';
}

export function shouldUseNativeImages(terminalInfo: TerminalInfo): boolean {
  return terminalInfo.type === 'iterm';
}
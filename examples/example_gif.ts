import pixelPop from '../dist/index.js';

const gifPath = new URL('rainbow.gif', import.meta.url);

const stop = await pixelPop.gifFile(gifPath.pathname, {
  width: '80%',
  maximumFrameRate: 24
});

setTimeout(stop, 5000);

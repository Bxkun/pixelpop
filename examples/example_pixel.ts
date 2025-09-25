import pixelPop from "../dist/index.js";

const imagePath = new URL("angry_cat.png", import.meta.url);

(async () => {
  const output = await pixelPop.file(imagePath.pathname, { width: "60%" });
  console.log(output);
})();

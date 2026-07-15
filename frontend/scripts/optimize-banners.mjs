import sharp from "sharp";
import { statSync } from "fs";

const banners = [
  {
    input: "public/board-banners/aboutus.png",
    output: "public/board-banners/aboutus.webp",
    width: 1920,
  },
  {
    input: "public/board-banners/business.png",
    output: "public/board-banners/business.webp",
    width: 1920,
  },
];

for (const banner of banners) {
  const before = statSync(banner.input).size;
  const meta = await sharp(banner.input).metadata();
  await sharp(banner.input)
    .resize({ width: banner.width, withoutEnlargement: true })
    .webp({ quality: 82, effort: 6 })
    .toFile(banner.output);
  const after = statSync(banner.output).size;
  console.log(
    `${banner.input}: ${meta.width}x${meta.height} ${Math.round(before / 1024)}KB -> ${banner.output} ${Math.round(after / 1024)}KB`
  );
}

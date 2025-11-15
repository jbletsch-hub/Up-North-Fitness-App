import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateSquareIcon(inputPath, outputPath, size) {
  console.log(`Generating ${size}x${size} icon...`);
  
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  
  const aspectRatio = metadata.width / metadata.height;
  let resizeWidth, resizeHeight;
  
  if (aspectRatio > 1) {
    resizeWidth = Math.floor(size * 0.8);
    resizeHeight = Math.floor(resizeWidth / aspectRatio);
  } else {
    resizeHeight = Math.floor(size * 0.8);
    resizeWidth = Math.floor(resizeHeight * aspectRatio);
  }
  
  const resizedImage = await image
    .resize(resizeWidth, resizeHeight, {
      fit: 'inside',
      withoutEnlargement: false
    })
    .toBuffer();
  
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
  .composite([{
    input: resizedImage,
    gravity: 'center'
  }])
  .png()
  .toFile(outputPath);
  
  console.log(`✓ Created ${outputPath}`);
}

async function main() {
  const publicDir = join(__dirname, '../client/public');
  const inputPath = join(publicDir, 'compass-logo.png');
  
  await generateSquareIcon(inputPath, join(publicDir, 'icon-192.png'), 192);
  await generateSquareIcon(inputPath, join(publicDir, 'icon-512.png'), 512);
  await generateSquareIcon(inputPath, join(publicDir, 'apple-touch-icon.png'), 180);
  
  console.log('\n✓ All icons generated successfully!');
}

main().catch(console.error);

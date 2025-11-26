const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [32, 72, 96, 128, 144, 152, 180, 192, 384, 512];
const inputSvg = path.join(__dirname, '../public/icons/icon.svg');
const outputDir = path.join(__dirname, '../public/icons');

async function generateIcons() {
    console.log('Generating PWA icons...');

    for (const size of sizes) {
        const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

        await sharp(inputSvg)
            .resize(size, size)
            .png()
            .toFile(outputPath);

        console.log(`  Created: icon-${size}x${size}.png`);
    }

    // Apple touch icon (180x180)
    await sharp(inputSvg)
        .resize(180, 180)
        .png()
        .toFile(path.join(outputDir, 'apple-touch-icon.png'));
    console.log('  Created: apple-touch-icon.png');

    console.log('Done!');
}

generateIcons().catch(console.error);

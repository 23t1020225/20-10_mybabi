const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const ffmpeg = 'C:\\Users\\tranv\\AppData\\Local\\CapCut\\Apps\\8.9.1.3802\\ffmpeg.exe';

if (!fs.existsSync('images')) {
    fs.mkdirSync('images');
}

function cropBmp(srcPath, dstPath, x, y, width, height) {
    const buf = fs.readFileSync(srcPath);
    const dataOffset = buf.readUInt32LE(10);
    const srcW = buf.readInt32LE(18);
    const srcH = buf.readInt32LE(22);
    const bpp = buf.readUInt16LE(28);
    if (bpp !== 24) throw new Error('Only 24bpp supported, got ' + bpp);

    const srcRowSize = Math.floor((srcW * 3 + 3) / 4) * 4;
    const dstRowSize = Math.floor((width * 3 + 3) / 4) * 4;
    const dstBuf = Buffer.alloc(54 + dstRowSize * height);

    buf.copy(dstBuf, 0, 0, 54);
    dstBuf.writeUInt32LE(dstBuf.length, 2);
    dstBuf.writeInt32LE(width, 18);
    dstBuf.writeInt32LE(height, 22);
    dstBuf.writeUInt32LE(dstRowSize * height, 34);

    for (let row = 0; row < height; row++) {
        const srcRow = srcH > 0 ? (srcH - 1 - (y + row)) : (y + row);
        const dstRow = height - 1 - row;
        const srcOffset = dataOffset + srcRow * srcRowSize + x * 3;
        const dstOffset = 54 + dstRow * dstRowSize;
        buf.copy(dstBuf, dstOffset, srcOffset, srcOffset + width * 3);
    }
    fs.writeFileSync(dstPath, dstBuf);
}

// Convert frames to BMP first
const targets = [
    { frame: 'frame_lightbox_1.jpg', bmp: 'lb1.bmp', crop: [432, 217, 316, 433], out: 'images/photo1.jpg' },
    { frame: 'frame_lightbox_2.jpg', bmp: 'lb2.bmp', crop: [432, 217, 316, 433], out: 'images/photo2.jpg' },
    { frame: 'frame_30.jpg', bmp: 'f30.bmp', crop: [468, 275, 154, 210], out: 'images/photo3.jpg' },
    { frame: 'frame_33.jpg', bmp: 'f33.bmp', crop: [468, 275, 154, 210], out: 'images/photo4.jpg' },
    { frame: 'frame_35.jpg', bmp: 'f35.bmp', crop: [468, 275, 154, 210], out: 'images/photo5.jpg' }
];

targets.forEach((t, i) => {
    console.log(`Processing target ${i + 1}...`);
    execSync(`"${ffmpeg}" -y -i "${t.frame}" "${t.bmp}"`, { stdio: 'ignore' });
    const tempBmp = `crop_${i}.bmp`;
    cropBmp(t.bmp, tempBmp, t.crop[0], t.crop[1], t.crop[2], t.crop[3]);
    execSync(`"${ffmpeg}" -y -i "${tempBmp}" -q:v 2 "${t.out}"`, { stdio: 'ignore' });
    if (fs.existsSync(t.bmp)) fs.unlinkSync(t.bmp);
    if (fs.existsSync(tempBmp)) fs.unlinkSync(tempBmp);
});

// Also create puzzle_image.jpg (using photo1)
fs.copyFileSync('images/photo1.jpg', 'images/puzzle.jpg');
console.log('All images extracted and saved to images/ successfully!');

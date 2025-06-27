import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';

const inputPath = './output_frames';
const outputPath = 'output-bayer2.gif';


// Choose between 'bayer' or 'floyd_steinberg'
// const DITHER_TYPE = 'floyd_steinberg'; // Change to 'bayer' if you prefer that
const DITHER_TYPE = 'bayer'; // Change to 'bayer' if you prefer that

// Get sorted images
const images = fs.readdirSync(inputPath)
  .filter(file => file.endsWith('.jpg'))
  .sort((a, b) => a.localeCompare(b)); // Ensuring correct order

// Ensure there are images
if (images.length === 0) {
  console.error('No images found in input directory');
  process.exit(1);
}

// Generate palette for better GIF quality
const palettePath = './palette.png';

// Construct input pattern (assumes sequential naming like frame_0001.png)
const inputPattern = `${inputPath}/%04d.jpg`; // Adjust %04d if your numbering differs

ffmpeg()
  .input('./output_frames/frame-*.jpg')
  .inputOptions(['-pattern_type glob', '-framerate 5'])
  .outputOptions([
    '-vf',
    'scale=800:-1,crop=800:800:0:250,palettegen',
    '-y'
  ])
  .save(palettePath)
  .on('end', () => {
    // Now create the final GIF using the palette and selected dither
    ffmpeg()
      .input('./output_frames/frame-*.jpg')
      .inputOptions(['-pattern_type glob', '-framerate 5'])
      .input(palettePath)
      .complexFilter([
        '[0:v]scale=800:-1,crop=800:800:0:250[scaled];[scaled][1:v]paletteuse=dither=' + DITHER_TYPE
      ])
      .outputOptions(['-loop 0'])
      .output(outputPath)
      .on('end', () => console.log('GIF created successfully'))
      .on('error', err => console.error('Error creating GIF:', err))
      .run();
  })
  .on('error', err => console.error('Error generating palette:', err));

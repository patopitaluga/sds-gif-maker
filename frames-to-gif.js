import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';

const inputPath = './output_frames';
const outputPath = 'output.gif';

// Get sorted images
const images = fs.readdirSync(inputPath)
  .filter(file => file.endsWith('.png'))
  .sort((a, b) => a.localeCompare(b)); // Ensuring correct order

// Ensure there are images
if (images.length === 0) {
  console.error('No images found in input directory');
  process.exit(1);
}

// Construct input pattern (assumes sequential naming like frame_0001.png)
const inputPattern = `${inputPath}/%04d.png`; // Adjust %04d if your numbering differs

ffmpeg()
  .input('./output_frames/frame-*.png') // Match all PNG files with "frame-" prefix
  .inputOptions(['-pattern_type glob', '-framerate 5']) // Set frame rate
  .output('output.gif')
  .outputOptions(['-vf', 'scale=800:-1', '-loop 0'])
  .on('end', () => console.log('GIF created successfully'))
  .on('error', err => console.error('Error creating GIF:', err))
  .run();


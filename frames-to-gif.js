import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';

const inputPath = './output_frames';
const outputPath = 'output.gif';

const DITHER_TYPE = 'bayer'; // or 'floyd_steinberg'

const extension = '.jpg';

// Get sorted images
const images = fs.readdirSync(inputPath)
  .filter(file => file.endsWith(extension))
  .sort((a, b) => a.localeCompare(b)); // Ensuring correct order

// Ensure there are images
if (images.length === 0) {
  console.error('No images found in input directory');
  process.exit(1);
}

const generatePalette = () => {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(`${inputPath}/*${extension}`)
      .inputOptions(['-pattern_type glob', '-framerate 5'])

      .outputOptions([
        '-vf', 'palettegen',
        '-frames:v', '1',
        '-update', '1',
        '-y'
      ])

      .on('stderr', console.log)
      .save('./palette.png') // Generate palette for better GIF quality
      .on('end', () => {
        resolve(true);
      })
      .on('error', err => {
        console.error('Error generating palette:', err);
        reject(err);
      });
  });
};
await generatePalette();

const WIDTH = 300;

ffmpeg()
  .input(`${inputPath}/frame-*${extension}`)
  .inputOptions(['-pattern_type glob', '-framerate 5'])

  .input('./palette.png')

  /*
  .complexFilter([
    '[0:v]scale=800:-1,crop=800:800:0:250[scaled];[scaled][1:v]paletteuse=dither=' + DITHER_TYPE
  ])*/
  .complexFilter(`[0:v]scale=${WIDTH}:-1[scaled];[scaled][1:v]paletteuse=dither=${DITHER_TYPE}`)
  .outputOptions(['-loop 0'])
  .output(outputPath)
  .on('start', cmd => console.log('FFmpeg command:', cmd))
  .on('end', () => console.log('GIF created successfully'))
  .on('error', err => console.error('Error creating GIF:', err))
  .run();

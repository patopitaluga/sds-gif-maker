import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';

const inputDir = 'output_frames';
const outputDir = 'output_frames';

fs.readdir(inputDir, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  files.forEach(file => {
    if (file.endsWith('.png')) {
      const inputPath = `${inputDir}/${file}`;
      const outputFilename = file.replace('.png', '.jpg');
      const outputPath = `${outputDir}/${outputFilename}`;

      ffmpeg(inputPath)
        .output(outputPath)
        .on('end', () => {
          console.log(`File ${file} converted successfully to ${outputFilename}`);
        })
        .on('error', err => {
          console.error(`Error converting file ${file}:`, err);
        })
        .run();
    }
  });
});

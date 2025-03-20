import ffmpeg from 'fluent-ffmpeg';
import path from 'path';

const inputFilePath = 'sds1.mov';
const outputDirectory = 'output_frames';

ffmpeg(inputFilePath)
  .outputOptions('-vf', 'fps=1') // Extract 1 frame per second
  .on('end', () => {
    console.log('Frames extracted successfully');
  })
  .on('error', (err) => {
    console.error('Error extracting frames:', err);
  })
  .save(outputDirectory + path.sep + 'frame-%04d.png');


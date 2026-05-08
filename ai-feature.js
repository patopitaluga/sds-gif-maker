import OpenAI from 'openai';
import fs from 'fs';

const openai = new OpenAI();

const frameFiles = fs
  .readdirSync('.')
  .filter((name) => name.startsWith('sds-gif-frame') && name.endsWith('.png'))
  .sort((a, b) => {
    const ma = a.match(/^sds-gif-frame(\d+)\.png$/);
    const mb = b.match(/^sds-gif-frame(\d+)\.png$/);
    if (ma && mb) return Number(ma[1]) - Number(mb[1]);
    return a.localeCompare(b);
  });

// first image
const data1 = fs.readFileSync('sds-gif-frame-01.png');
const base64image1 = data1.toString('base64');

let userPrompt = '';
for (let i = 2; i < process.argv.length; i++) {
  userPrompt += ' ' + process.argv[i];
}
userPrompt = userPrompt.trim();

const startTime = new Date();
const response = await openai.responses.create({
  model: 'gpt-5.4',
  input: [
    {
      role: 'user',
      content: [
        { type: 'input_text', text: `${userPrompt}. Keep the same size and aspect ratio of the original image.` },
        {
          type: 'input_image',
          image_url: `data:image/png;base64,${base64image1}`
        },
      ],
    }
  ],
  tools: [{
    type: 'image_generation',
    model: 'gpt-image-2',
    size: 'auto',
    quality: 'low',
  }],
})
  .then((response) => {
    const imageData = response.output
      .filter((output) => output.type === 'image_generation_call')
      .map((output) => output.result);

    const currentTime = new Date();
    console.log('In', (currentTime - startTime) / 1000, 'seconds');

    const imageBase64 = imageData[0];
    const suffix = 'sds-gif-frame-01.png'.replace(/^sds-gif-frame/, '').replace(/\.png$/i, '');
    const outName = `output${suffix}.png`;
    fs.writeFileSync(outName, Buffer.from(imageBase64, 'base64'));
    console.log(`${outName} generated`);
  })
  .catch((err) => {
    console.error(err);
  });

const data2 = fs.readFileSync('output-01.png');
const base64image2 = data2.toString('base64');

let skipFirst = true;
for (const file of frameFiles) {
  if (skipFirst) {
    skipFirst = false;
    continue;
  }
  console.log(`Processing ${file}`)
  const data1 = fs.readFileSync(file);
  const base64image1 = data1.toString('base64');

  const startTime = new Date();
  openai.responses.create({
    model: 'gpt-5.4',
    input: [{
      role: 'user',
      content: [
        { type: 'input_text', text: `${userPrompt}. Keep the same size and aspect ratio of the original image. Use the second image for consistency because this will be a frame in an animation` },
        {
          type: 'input_image',
          image_url: `data:image/png;base64,${base64image1}`
        },
        {
          type: 'input_image',
          image_url: `data:image/png;base64,${base64image2}`
        }
      ],
    }],
    tools: [{
      type: 'image_generation',
      model: 'gpt-image-2',
      size: 'auto',
      quality: 'low',
    }],
  })
    .then((response) => {
      const imageData = response.output
        .filter((output) => output.type === 'image_generation_call')
        .map((output) => output.result);

      const currentTime = new Date();
      console.log('In', (currentTime - startTime) / 1000, 'seconds');

      const imageBase64 = imageData[0];
      const suffix = file.replace(/^sds-gif-frame/, '').replace(/\.png$/i, '');
      const outName = `output${suffix}.png`;
      fs.writeFileSync(outName, Buffer.from(imageBase64, 'base64'));
      console.log(`${outName} generated`);
    })
    .catch((err) => {
      console.error(err);
    });

}

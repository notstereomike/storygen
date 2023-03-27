const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const fs = require('fs');

const apiKey = process.env.OPENAI_API_KEY;
const client = axios.create({
  headers: { 'Authorization': 'Bearer ' + apiKey }
});

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.post('/generate', async (req, res) => {
  const { gender, race, classType, generateImage } = req.body;

  const params = {
    "prompt": `Write complete and concise 300 word backstory for a fictional D&D Charecter who is a ${gender} ${race} ${classType} character.`,
    max_tokens: 350,
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  };

  try {
    const storyResult = await client.post('https://api.openai.com/v1/engines/text-davinci-002/completions', params);
    const story = storyResult.data.choices[0].text;

    // Save the story to a file
    const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
    const storyFileName = `output/story_${timestamp}.txt`;
    fs.writeFileSync(storyFileName, story);

    if (generateImage === 'on') {
      const imagePrompt = `A ${gender} ${race} ${classType}. Epic, Fantasy Art, Sharp, 4K`;

      const imageResponse = await client.post('https://api.openai.com/v1/images/generations', {
        prompt: imagePrompt,
        n: 1,
        size: '256x256',
      });

      const imageUrl = imageResponse.data.data[0].url;
      const imageBuffer = await axios.get(imageUrl, { responseType: 'arraybuffer' });

      // Save the image to a file
      const imageFileName = `output/image_${timestamp}.png`;
      fs.writeFileSync(imageFileName, Buffer.from(imageBuffer.data), 'binary');

      res.send({ story, imageUrl });
    } else {
      res.send({ story });
    }
  } catch (err) {
    console.log(err);
    res.send({ error: 'Error generating story' });
  }
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
});

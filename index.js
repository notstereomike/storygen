const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

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

app.post('/generate', (req, res) => {
    const { race, classType } = req.body;

    const params = {
        "prompt": `Write a 250 word backstory for a fictional D&D Charecter who is a ${race} ${classType} character`, 
        max_tokens: 256,
        temperature: 0.7,
      
        
        
        
    }

    client.post('https://api.openai.com/v1/engines/text-davinci-002/completions', params)
        .then(result => {
            const story = result.data.choices[0].text;
            res.send(story);
        }).catch(err => {
            console.log(err);
            res.send('Error generating story');
        });
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
});
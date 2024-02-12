require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.json());
// DNS and url:
const dns = require('dns');
const urlParser = require('url')
//Body parser:
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

// Mongodb model and connection:
const mongoose = require('mongoose')
const mongo_url = process.env.MONGO_URI
mongoose.set('strictQuery', false)

mongoose.connect(mongo_url)
  .then(() => {
    console.log('Database conected! 🦎🦎🦎')
  })
  .catch(error => {
    console.log('DataBase refused to connect. ', error.message)
  })

const urlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true
  },
  shortened_url: {
    type: Number,
    required: true
  }
})

const URLModel = mongoose.model('URLModel', urlSchema)

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', (req, res) => {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res) => {
  const url = req.body.url;
  
  dns.lookup(urlParser.parse(url).hostname, async (error, url) => {
    if (error || !url) {
      res.json({ error: 'invalid url' });
    } else {
      const existUrl = await URLModel.findOne({ original_url: req.body.url })

      if (!existUrl) {
        // Making a new object to save in the database:
        const count = await URLModel.countDocuments()
        const urlObject = new URLModel( {
          original_url: req.body.url,
          shortened_url: count + 1
        })

        await urlObject.save();
        res.json({ original_url: req.body.url, short_url: count + 1 })
      } else {
        res.json({
          original_url: existUrl.original_url,
          short_url: existUrl.shortened_url
        })
      }
    }
  })
})

app.get('/api/shorturl/:url', async (req, res) => {
  const url = await URLModel.findOne({ shortened_url: req.params.url })

  if (url) {
    res.redirect(url.original_url)
  } else {
    res.json({ error: 'The url does not exists in the database.' })
  }
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
  console.log(`http://localhost:${port}`);
});

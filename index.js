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

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', (req, res) => {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res) => {
  // const newUrl = new URL(url)
  // console.log(newUrl)
  const url = req.body.url
  
  dns.lookup(urlParser.parse(url).hostname, async (error, url) => {
    if (error || !url) {
      res.json({ error: 'invalid url' })
    } else {
      res.json({ message: 'not invalid url' })
    }
  })
  
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
  console.log(`http://localhost:${port}`);
});

const express = require('express');
const serverless = require('serverless-http');
const app = express();
const router = express.Router();
const { HfInference } = require("@huggingface/inference");
const axios = require('axios');
require('dotenv').config();

let records = [];

// Hardcoded image URL
const imageUrl = "https://www.janiking.com/wp-content/uploads/elementor/thumbs/LOGO-JK-qcezhecl6xopj7m9i6vpqm2w6rikt7y6i6ehuje0t8.png.webp";

// Function to download image and convert to blob
async function getImageBlob(imageUrl) {
  const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
  const contentType = response.headers['content-type'];
  return new Blob([response.data], { type: contentType });
}

// Function to generate a description of the image using Hugging Face Inference API
async function describeImage(blob) {
  const inference = new HfInference(process.env.HF_TOKEN);
  const result = await inference.imageToText({
    data: blob,
    model: "Salesforce/blip-image-captioning-base",
  });
  return result;
}

// Router for analyzing the image
router.get('/analyze-image', async (req, res) => {
  try {
    const imageBlob = await getImageBlob(imageUrl);
    const description = await describeImage(imageBlob);
    res.json({ description });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).send('Error processing image');
  }
});

// Existing routers
router.get('/', (req, res) => {
  res.send('App is running..');
});

router.post('/add', (req, res) => {
  res.send('New record added.');
});

router.delete('/', (req, res) => {
  res.send('Deleted existing record');
});

router.put('/', (req, res) => {
  res.send('Updating existing record');
});

router.get('/demo', (req, res) => {
  res.json([
    {
      id: '001',
      name: 'Smith',
      email: 'smith@gmail.com',
    },
    {
      id: '002',
      name: 'Sam',
      email: 'sam@gmail.com',
    },
    {
      id: '003',
      name: 'Lily',
      email: 'lily@gmail.com',
    },
  ]);
});

app.use('/.netlify/functions/api', router);
module.exports.handler = serverless(app);
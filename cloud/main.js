console.log('Cloud code connected')

const captureWebsite = require('capture-website');
const ColorThief = require('colorthief');
const fs = require('fs');
const pdf2pic = require('pdf2pic');
const { fromBase64 } = pdf2pic;

const getPaletteByImageAndRemove = async imagePath => {
  let result
  try {
    result = await ColorThief.getPalette(imagePath)
  } catch (err) {
    result = { status: 500, message: 'Get palette error' }
  }

  fs.unlink(imagePath, err => console.log('File remove error => ', err));
  return result
}

Parse.Cloud.define('getPalette', async request => {
  const params = request.params;
  const brandUrl = params?.brandUrl;

  if (!brandUrl) {
    return { status: 400, message: 'Please provide field brandUrl' };
  }

  const filename = brandUrl.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const filePath = `./${filename}.png`;

  try {
    await captureWebsite.file(brandUrl, filePath, { fullPage: true });
  } catch (err) {
    console.log('Invalid brand url', err)
    return { status: 400, message: 'Invalid brand url' };
  }

  return await getPaletteByImageAndRemove(filePath)
})

Parse.Cloud.define('getPdfPalette', request => {
  const params = request.params
  const pdf = params.b64pdf
  fs.writeFile
  fromBase64(pdf, { savePath: './' }).convert()
})
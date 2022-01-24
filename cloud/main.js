console.log('Cloud code connected')

import captureWebsite from 'capture-website';
import ColorThief from 'colorthief';
import fs from 'fs';

Parse.Cloud.define('getPalette', async request => {
  const params = request.params;
  const brandUrl = params?.brandUrl;

  if (!brandUrl) {
    return { status: 400, message: 'Please provide field brandUrl' };
  }

  const filename = brandUrl.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const filePath = `./src/${filename}.png`;

  try {
    await captureWebsite.file(brandUrl, filePath, { fullPage: true });
  } catch (err) {
    return { status: 400, message: 'Invalid brand url' };
  }

  let result
  try {
    result = await ColorThief.getPalette(filePath)
  } catch (err) {
    result = { status: 500, message: 'Get palette error' }
  }

  fs.unlink(filePath, err => console.log('File remove error => ', err));
  return result
})
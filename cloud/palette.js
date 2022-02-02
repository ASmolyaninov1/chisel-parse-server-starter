console.log('Cloud code connected')

Parse.Cloud.define('getScreenshot', async request => {
  const params = request.params;
  const brandUrl = params?.brandUrl;
  const axios = await import('axios');

  if (!brandUrl) {
    return { status: 400, message: 'Please provide field brandUrl' };
  }

  const b64screenshot = await axios.default.get('https://api.apiflash.com/v1/urltoimage', {
    params: {
      access_key: '8050ceb6f483464daf907546ded78c06',
      url: brandUrl,
      full_page: true,
      quality: 100,
      no_ads: true
    },
    responseType: 'arraybuffer'
  }).then((res) => {
    const { data } = res;
    if (!data) return { status: 500, message: 'Screenshot broken' };

    return data.toString('base64');
  }).catch((err) => {
    return { status: 400, message: err };
  });

  return { status: 200, screenshot: b64screenshot };
});

// Parse.Cloud.define('getPdfPalette', request => {
//   const params = request.params
//   const pdf = params.b64pdf
//   fs.writeFile
//   fromBase64(pdf, { savePath: './' }).convert()
// })
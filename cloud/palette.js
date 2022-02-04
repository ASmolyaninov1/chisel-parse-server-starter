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

Parse.Cloud.define('getPdfScreenshot', async request => {
  const params = request.params
  const pdf = params.pdf

  console.log('pdf => ', params)

  const pdf2pic = await import('pdf2pic')
  console.log('pdf2pic.default => ', pdf2pic.default)
  const pdfImage = await pdf2pic.default.fromBuffer(pdf)
  return { status: 200, pdfImage }
})
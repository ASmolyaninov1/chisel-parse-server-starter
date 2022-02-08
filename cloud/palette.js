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
  const b64pdf = params.pdf

  const axios = await import('axios')
  const fs = await import('fs')
  const FormData = await import('form-data')
  const fd = new FormData.default()
  const pdfBuffer = await fs.default.readFile(b64pdf)
  fd.append('File', pdfBuffer)
  // try {
  //   await fs.default.writeFile('pdf.pdf', b64pdf, { encoding: 'base64' }, (err) => console.log('callback err => ', err))
  // } catch (err) {
  //   console.log('write file err ======> ', err)
  //   console.log('write file err message ======> ', err.message)
  // }

  let res
  try {
    res = await axios.default.post('https://v2.convertapi.com/convert/pdf/to/jpg?Secret=y1Tyo5zBrFdTzLRb&StoreFile=true', fd)
  } catch (err) {
    console.log('api request error =======> ', err)
    console.log('api request error message =======> ', err.message)
  }

  return { status: 200, result: res }
})
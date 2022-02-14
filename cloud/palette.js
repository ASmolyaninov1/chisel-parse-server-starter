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
  const b64pdf = params.pdf.split('base64,')[1]

  const axios = await import('axios')
  const FormData = await import('form-data')

  const fd = new FormData.default()
  const bufferFile = Buffer.from(b64pdf, 'base64')
  fd.append('File', bufferFile, { filename: 'pdf.pdf' })

  let res
  let pdfImagesData
  try {
    pdfImagesData = await axios.default.post(
      'https://v2.convertapi.com/convert/pdf/to/jpg?Secret=y1Tyo5zBrFdTzLRb&S&StoreFile=true',
      fd,
      {
        headers: fd.getHeaders()
      }
    )
  } catch (err) {
    res = { status: 500, message: err.message }
  }

  if (pdfImagesData?.data?.Files) {
    res = pdfImagesData?.data?.Files
  }

  return res
})
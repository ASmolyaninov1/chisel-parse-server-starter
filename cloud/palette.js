console.log('Cloud code connected')

const getPaletteByImageAndRemove = async imagePath => {
  const ColorThief = await import("colorthief")
  let result
  try {
    result = await ColorThief.getPalette(imagePath)
  } catch (err) {
    result = { status: 500, message: 'Get palette error' }
  }

  return result
}

Parse.Cloud.define('getPalette', async request => {
  const params = request.params;
  const brandUrl = params?.brandUrl;
  const axios = await import('axios')

  if (!brandUrl) {
    return { status: 400, message: 'Please provide field brandUrl' };
  }

  await axios.default.get('https://api.apiflash.com/v1/urltoimage', {
    params: {
      access_key: '8050ceb6f483464daf907546ded78c06',
      url: brandUrl,
      full_page: true,
      quality: 100,
      no_ads: true
    }
  }).then(res => {

  }).catch((err) => {
    console.log('Invalid brand url', err)
    return { status: 400, message: err };
  })

  return 'test'

  // return await getPaletteByImageAndRemove(filePath)
})

// Parse.Cloud.define('getPdfPalette', request => {
//   const params = request.params
//   const pdf = params.b64pdf
//   fs.writeFile
//   fromBase64(pdf, { savePath: './' }).convert()
// })
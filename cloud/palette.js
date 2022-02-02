console.log('Cloud code connected')

const getPaletteByImageAndRemove = async imagePath => {
  const ColorThief = await import("colorthief")
  const fs = await import("fs")
  let result
  try {
    result = await ColorThief.default.getPalette(imagePath)
  } catch (err) {
    result = { status: 500, message: 'Get palette error: ' + err.message }
  }
  fs.default.rm('./' + imagePath, (err) => console.log('Remove error message ===> ', err))
  return result
}

Parse.Cloud.define('getPalette', async request => {
  const params = request.params;
  const brandUrl = params?.brandUrl;
  const axios = await import('axios')
  const fs = await import('fs')

  if (!brandUrl) {
    return { status: 400, message: 'Please provide field brandUrl' };
  }

  const filename = 'screenshot.jpeg'

  const screenshotResponse = await axios.default.get('https://api.apiflash.com/v1/urltoimage', {
    params: {
      access_key: '8050ceb6f483464daf907546ded78c06',
      url: brandUrl,
      full_page: true,
      quality: 100,
      no_ads: true
    }
  }).catch((err) => {
    console.log('Invalid brand url', err)
    return { status: 400, message: err };
  })

  const screenshot = screenshotResponse?.data
  if (!screenshot) return { status: 500, message: 'Screenshot broken' }
  try {
    fs.default.writeFileSync(filename, screenshot)
  } catch (e) {
    return { status: 500, message: 'Write file error' }
  }

  return await getPaletteByImageAndRemove(filename)
})

// Parse.Cloud.define('getPdfPalette', request => {
//   const params = request.params
//   const pdf = params.b64pdf
//   fs.writeFile
//   fromBase64(pdf, { savePath: './' }).convert()
// })
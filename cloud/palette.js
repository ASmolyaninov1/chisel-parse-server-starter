console.log('Cloud code connected')

Parse.Cloud.define('getSiteScreenshot', async request => {
  const params = request.params;
  const brandUrl = params?.brandUrl;
  const axios = await import('axios');

  if (!brandUrl) {
    return { error: 'Please provide field brandUrl' };
  }

  try {
    const b64screenshotData = await axios.default.get('https://api.apiflash.com/v1/urltoimage', {
      params: {
        access_key: '8050ceb6f483464daf907546ded78c06',
        url: brandUrl,
        full_page: true,
        quality: 100,
        no_ads: true
      },
      responseType: 'arraybuffer'
    })

    const { data } = b64screenshotData
    if (!data) return { error: 'Screenshot broken' };

    return { result: data.toString('base64') };
  } catch(err) {
    return { error: err };
  }
});

Parse.Cloud.define('getPdfScreenshot', async request => {
  const params = request.params
  const b64pdf = params.pdf.split('base64,')[1]

  const axios = await import('axios')
  const FormData = await import('form-data')

  const fd = new FormData.default()
  const bufferFile = Buffer.from(b64pdf, 'base64')
  fd.append('File', bufferFile, { filename: 'pdf.pdf' })

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
    return { error: err.message }
  }

  if (pdfImagesData?.data?.Files) {
    return { result: pdfImagesData?.data?.Files }
  } else {
    return { error: 'Something went wrong' }
  }
})

Parse.Cloud.define('createPalette', async request => {
  const params = request.params
  const colors = params.colors
  const title = params.title
  if (!colors || !colors.length) return { error: 'Provide "colors" field to set palette' }
  if (!title) return { error: 'Provide "title" field to set palette' }

  const Palette = Parse.Object.extend("Palette")
  const palette = new Palette()

  try {
    await palette.save({ colors, title })
    return { result: 'success' }
  } catch (e) {
    return { error: e }
  }
})

Parse.Cloud.define('getPalette', async request => {
  const params = request.params
  const id = params.id
  if (!id) return { error: "Provide palette id to get" }

  const Palette = Parse.Object.extend("Palette")
  const query = new Parse.Query(Palette)

  try {
    const currentPalette = await query.get(id)
    return { result: currentPalette }
  } catch (e) {
    return { error: e }
  }
})

Parse.Cloud.define('getAllPalettes', async () => {
  const Palette = Parse.Object.extend("Palette")
  const query = new Parse.Query(Palette)

  try {
    const allPalettes = await query.find()
    return { result: allPalettes }
  } catch (e) {
    return { error: e }
  }
})

Parse.Cloud.define('deletePalette', async request => {
  const params = request.params
  const id = params?.id
  if (!id) return { error: 'Provide "id" to delete palette' }

  const Palette = Parse.Object.extend("Palette")
  const query = new Parse.Query(Palette)

  try {
    const paletteToDelete = await query.get(id)
    await paletteToDelete.destroy()
    return { result: 'success' }
  } catch (e) {
    return { error: e }
  }
})

Parse.Cloud.define('updatePalette', async (request, response) => {
  const params = request.params
  const { id, colors, title } = params || {}
  if (!id || (!colors && !title)) return { error: 'Provide "id" and "colors" or "title" fields to update palette' }

  const Palette = Parse.Object.extend("Palette")
  const query = new Parse.Query(Palette)

  try {
    query.equalTo("objectId", id)
    return query.find().then(res => {
      const object = res[0]
      !!colors && object.set('colors', colors)
      !!title && object.set('title', title)
      object.save()
      return { result: 'success' }
    })
  } catch (e) {
    return { error: e }
  }
})
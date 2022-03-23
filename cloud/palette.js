const { getPalettesByUser, getPaletteByUser } = require('../helpers/palette')

Parse.Cloud.define('getSiteScreenshot', async request => {
  const params = request.params
  const { brandUrl } = params
  const axios = await import('axios')

  const urlExpression = new RegExp('(https?|ftp)://(-\\.)?([^\\s/?\\.#-]+\\.?)+(/[^\\s]*)?$')

  if (!brandUrl) return { error: 'Please provide field brandUrl' }
  if (!urlExpression.test(brandUrl) || !brandUrl.startsWith('http')) return { error: 'Provide valid url' }

  try {
    return await axios.default.get('https://api.apiflash.com/v1/urltoimage', {
      params: {
        access_key: '8050ceb6f483464daf907546ded78c06',
        url: brandUrl,
        full_page: true,
        quality: 100,
        no_ads: true
      },
      responseType: 'arraybuffer'
    }).then(b64screenshotData => {
      const { data } = b64screenshotData
      if (!data) return { error: 'Screenshot broken' }

      return { result: data.toString('base64') }
    }).catch(e => {
      const status = e.response.status
      if (status === 400) return { error: 'Invalid url' }
      return { error: 'Something went wrong' }
    })
  } catch(err) {
    return { error: err }
  }
})

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
  const headers = request.headers
  const params = request.params
  const { user } = headers
  const { colors, title, access } = params

  if (!access) return { error: 'Provide "access" field to set palette' }
  if (!colors || !colors.length) return { error: 'Provide "colors" field to set palette' }
  if (!title) return { error: 'Provide "title" field to set palette' }

  const Palette = Parse.Object.extend("Palette")
  const palette = new Palette()

  try {
    const createdPalette = await palette.save({ colors, title, access })
    const UserPalette = Parse.Object.extend("UserPalette")
    const userPalette = new UserPalette()

    await userPalette.save({
      paletteId: createdPalette.id,
      access,
      muralUsername: user.get('muralUsername'),
      muralWorkspace: user.get('muralWorkspace'),
      muralCompany: user.get('muralCompany')
    })

    return { result: createdPalette }
  } catch (e) {
    return { error: e }
  }
})

Parse.Cloud.define('getPalette', async request => {
  const params = request.params
  const headers = request.headers
  const { user } = headers
  const { id } = params
  if (!id) return { error: "Provide palette id to get" }

  try {
    const currentPalette = await getPaletteByUser(id, user)
    return { result: currentPalette }
  } catch (e) {
    return { error: e }
  }
})

Parse.Cloud.define('getAllPalettes', async request => {
  const headers = request.headers
  const { user } = headers

  try {
    const allPalettes = await getPalettesByUser(user)
    return { result: allPalettes }
  } catch (e) {
    return { error: e }
  }
})

Parse.Cloud.define('deletePalette', async request => {
  const params = request.params
  const headers = request.headers
  const { user } = headers
  const { id } = params
  if (!id) return { error: 'Provide "id" to delete palette' }

  const currentPalette = await getPaletteByUser(id, user)
  if (currentPalette?.error) return currentPalette

  try {
    const userPaletteQuery = new Parse.Query("UserPalette")
    userPaletteQuery.equalTo('paletteId', id)
    const currentUserPalette = userPaletteQuery.first()
    await currentUserPalette.destroy()
    await currentPalette.destroy()
    return { result: 'success' }
  } catch (e) {
    return { error: e }
  }
})

Parse.Cloud.define('updatePalette', async (request) => {
  const params = request.params
  const headers = request.headers
  const { user } = headers
  const { id, colors, title, access } = params
  const isParamsValid = !!colors || !!title || !!access
  if (!id || !isParamsValid) return { error: 'Provide "id" and fields of palette to update fields to update palette' }

  const currentPalette = await getPaletteByUser(id, user)
  if (currentPalette?.error) return currentPalette

  if (access !== currentPalette.get('access')) {
    const userPaletteQuery = new Parse.Query("UserPalette")
    userPaletteQuery.equalTo('paletteId', id)
    const currentUserPalette = await userPaletteQuery.first()
    currentUserPalette.set('access', access)
    await currentUserPalette.save()
  }

  try {
    !!colors && currentPalette.set('colors', colors)
    !!title && currentPalette.set('title', title)
    !!access && currentPalette.set('access', access)
    await currentPalette.save()
    return { result: 'success' }
  } catch (e) {
    return { error: e }
  }
})

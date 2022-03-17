const { getUser } = require('../helpers/user')

Parse.Cloud.define('getSiteScreenshot', async request => {
  const params = request.params;
  const { brandUrl } = params;
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
  const headers = request.headers
  const params = request.params
  const { muralUsername } = headers
  const { colors, title, access } = params

  if (!muralUsername) return { error: 'Provide "muralUsername" header to set palette' }
  if (!access) return { error: 'Provide "access" field to set palette' }
  if (!colors || !colors.length) return { error: 'Provide "colors" field to set palette' }
  if (!title) return { error: 'Provide "title" field to set palette' }

  const currentUser = await getUser(muralUsername)

  const Palette = Parse.Object.extend("Palette")
  const palette = new Palette()

  try {
    const createdPalette = await palette.save({ colors, title, access })
    const UserPalette = Parse.Object.extend("UserPalette")
    const userPalette = new UserPalette()
    userPalette.set("paletteId", createdPalette.objectId)
    userPalette.set("access", access)
    switch (access) {
      case 'me':
        userPalette.set("foreignKey", currentUser.muralUsername)
        break
      case 'workspace':
        userPalette.set("foreignKey", currentUser.muralWorkspace)
        break
      case 'company':
        userPalette.set("foreignKey", currentUser.muralCompany)
        break
    }
    await userPalette.save()

    return { result: createdPalette }
  } catch (e) {
    return { error: e }
  }
})

Parse.Cloud.define('getPalette', async request => {
  const params = request.params
  const headers = request.headers
  const { muralUsername } = headers
  const { id } = params
  if (!muralUsername) return { error: 'Provide "muralUsername" in headers' }
  if (!id) return { error: "Provide palette id to get" }

  const currentUser = getUser(muralUsername)

  if (!currentUser?.muralUsername) return { error: 'User not found' }

  try {
    const Palette = Parse.Object.extend("Palette")
    const query = new Parse.Query(Palette)

    const UserPalette = Parse.Object.extend("UserPalette")
    const userPaletteQuery = new Parse.Query(UserPalette)
    userPaletteQuery.equalTo('muralUsername', currentUser.muralUsername)
    userPaletteQuery.equalTo('paletteId', id)
    const currentUserPalette = await userPaletteQuery.first()
    if (!currentUserPalette?.paletteId) return { error: 'Palette not found' }

    const currentPalette = await query.get(id)
    return { result: currentPalette }
  } catch (e) {
    return { error: e }
  }
})

Parse.Cloud.define('getAllPalettes', async (request) => {
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
  const { id } = params
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

Parse.Cloud.define('updatePalette', async (request) => {
  const params = request.params
  const { id, colors, title, access } = params
  const isParamsValid = !!colors || !!title || !!access
  if (!id || !isParamsValid) {
    return { error: 'Provide "id" and "colors" or "title" fields to update palette' }
  }

  const Palette = Parse.Object.extend("Palette")
  const query = new Parse.Query(Palette)

  try {
    query.equalTo("objectId", id)
    return query.find().then(res => {
      const object = res[0]
      console.log(object.get('access'))
      !!colors && object.set('colors', colors)
      !!title && object.set('title', title)
      !!access && object.set('access', access)
      object.save()
      return { result: 'success' }
    })
  } catch (e) {
    return { error: e }
  }
})

Parse.Cloud.define('getOrCreateMuralUser', async request => {
  const params = request.params
  const { id, workspaceId, companyId } = params
  if (!id) return { error: 'Provide "id" to get or create a user' }
  console.log('check 1')

  const User = Parse.Object.extend('MuralUser')
  const query = new Parse.Query(User)
  query.equalTo('muralUsername', id)
  const user = await query.first()
  console.log('check user => ', user)
  if (!!user) return { result: user }
  console.log('check !user')

  const newUserInstance = new User()
  try {
    const newUser = await newUserInstance.save({ muralUsername: id, muralWorkspace: workspaceId, muralCompany: companyId })
    console.log('check new user => ', newUser)
    return { result: newUser }
  } catch (e) {
    console.log('check error => ', e)
    return { error: e }
  }
})
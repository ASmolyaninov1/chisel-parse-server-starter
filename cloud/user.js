const { getUser } = require('../helpers/user')
const {getPaletteByUser} = require("../helpers/palette")

Parse.Cloud.define('getOrCreateMuralUser', async request => {
  const params = request.params
  const { muralUsername, muralWorkspace, muralCompany } = params
  if (!muralUsername || !muralWorkspace) {
    return { error: 'Provide "muralUsername" and "muralWorkspace" to get or create a user' }
  }

  const user = await getUser(muralUsername)
  if (!!user && user.get('muralWorkspace') === muralWorkspace) return { result: user }
  if (!!user && user.get('muralWorkspace') !== muralWorkspace) {
    user.set('muralWorkspace', muralWorkspace)
    const updatedUser = await user.save()
    return { result: updatedUser }
  }

  const User = Parse.Object.extend('MuralUser')
  const newUserInstance = new User()
  try {
    const newUser = await newUserInstance.save({ muralUsername, muralWorkspace, muralCompany })
    return { result: newUser }
  } catch (e) {
    return { error: e }
  }
})

Parse.Cloud.define('getCurrentUser', async request => {
  const headers = request.headers
  const { user } = headers

  return { result: user }
})

Parse.Cloud.define("setDefaultPalette", async request => {
  const params = request.params
  const headers = request.headers
  const { id } = params
  const { user } = headers
  const userDefaultPaletteId = user.get("defaultPaletteId")

  const palette = await getPaletteByUser(id, user)
  if (!palette) return { error: 'Palette not found' }

  if (id === userDefaultPaletteId) {
    user.set('defaultPaletteId', null)
  } else {
    user.set('defaultPaletteId', palette.id)
  }

  const updatedUser = await user.save()
  return { result: updatedUser }
})

Parse.Cloud.define("updateUserFavouritePalettes", async request => {
  const params = request.params
  const headers = request.headers
  const { id } = params
  const { user } = headers

  if (!id) return { error: 'Provide "id" to add or remove palette in favourites' }

  const palette = await getPaletteByUser(id, user)
  if (palette?.error) return palette

  let currentFavouritePalettes = user.get('favouritePalettesIds') || []
  if (currentFavouritePalettes.includes(id)) {
    currentFavouritePalettes = currentFavouritePalettes.filter(paletteId => paletteId !== id)
  } else {
    currentFavouritePalettes = [...currentFavouritePalettes, id]
  }

  user.set('favouritePalettesIds', currentFavouritePalettes)
  const updatedUser = await user.save()
  return { result: updatedUser }
})
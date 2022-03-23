const getPalettesByUser = async (user) => {
  const muralUsername = user.get('muralUsername')
  const userMuralWorkspace = user.get('muralWorkspace')
  const userMuralCompany = user.get('muralCompany')

  const userPaletteQuery = new Parse.Query("UserPalette")
  userPaletteQuery.equalTo('muralUsername', muralUsername)
  userPaletteQuery.equalTo('access', 'me')

  const userPaletteWorkspaceQuery = new Parse.Query("UserPalette")
  userPaletteWorkspaceQuery.equalTo('muralWorkspace', userMuralWorkspace)
  userPaletteWorkspaceQuery.equalTo('access', 'workspace')

  const userPaletteCompanyQuery = new Parse.Query("UserPalette")
  userPaletteCompanyQuery.equalTo('muralCompany', userMuralCompany)
  userPaletteCompanyQuery.equalTo('access', 'company')

  const query = Parse.Query.or(userPaletteQuery, userPaletteWorkspaceQuery, userPaletteCompanyQuery)
  const userPalettes = await query.findAll()
  if (userPalettes.length === 0) return []
  const userPalettesIds = userPalettes.map(el => el.get('paletteId'))

  const Palette = Parse.Object.extend('Palette')
  const paletteQuery = new Parse.Query(Palette)
  paletteQuery.containedIn('objectId', userPalettesIds)
  return paletteQuery.findAll()
}

const getPaletteByUser = async (paletteId, user) => {
  const muralUsername = user.get('muralUsername')
  const muralWorkspace = user.get('muralWorkspace')
  const muralCompany = user.get('muralCompany')

  const userPaletteQuery = new Parse.Query("UserPalette")
  userPaletteQuery.equalTo('paletteId', paletteId)
  const currentUserPalette = await userPaletteQuery.first()
  if (!currentUserPalette) return { error: 'Palette not found' }

  const paletteMuralUsername = currentUserPalette.get('muralUsername')
  const paletteMuralWorkspace = currentUserPalette.get('muralWorkspace')
  const paletteMuralCompany = currentUserPalette.get('muralCompany')
  const paletteAccess = currentUserPalette.get('access')

  let isUserPermitted = false
  switch (paletteAccess) {
    case 'me':
      isUserPermitted = paletteMuralUsername === muralUsername
      break
    case 'workspace':
      isUserPermitted = paletteMuralWorkspace === muralWorkspace
      break
    case 'company':
      isUserPermitted = paletteMuralCompany && paletteMuralCompany === muralCompany
  }

  if (!isUserPermitted) {
    return { error: 'You do not have access to this palette' }
  }

  const paletteQuery = new Parse.Query('Palette')
  return paletteQuery.get(paletteId)
}

module.exports = { getPalettesByUser, getPaletteByUser }
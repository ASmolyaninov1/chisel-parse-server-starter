const getPalettesByUser = async (user) => {
  const muralUsername = user.get('muralUsername')
  const userMuralWorkspace = user.get('muralWorkspace')
  const userMuralCompany = user.get('muralCompany')

  const paletteQuery = new Parse.Query("Palette")
  paletteQuery.equalTo('muralUsername', muralUsername)

  const paletteWorkspaceQuery = new Parse.Query("Palette")
  paletteWorkspaceQuery.equalTo('muralWorkspace', userMuralWorkspace)
  paletteWorkspaceQuery.equalTo('access', 'workspace')

  const paletteCompanyQuery = new Parse.Query("Palette")
  paletteCompanyQuery.equalTo('muralCompany', userMuralCompany)
  paletteCompanyQuery.equalTo('access', 'company')

  const query = Parse.Query.or(paletteQuery, paletteWorkspaceQuery, paletteCompanyQuery)
  return await query.findAll()
}

const getPaletteByUser = async (paletteId, user) => {
  const muralUsername = user.get('muralUsername')
  const muralWorkspace = user.get('muralWorkspace')
  const muralCompany = user.get('muralCompany')

  const paletteQuery = new Parse.Query("Palette")
  const currentPalette = await paletteQuery.get(paletteId)

  const paletteMuralUsername = currentPalette.get('muralUsername')
  const paletteMuralWorkspace = currentPalette.get('muralWorkspace')
  const paletteMuralCompany = currentPalette.get('muralCompany')
  const paletteAccess = currentPalette.get('access')

  let isUserPermitted = paletteMuralUsername === muralUsername
  if (!isUserPermitted) {
    switch (paletteAccess) {
      case 'workspace':
        isUserPermitted = paletteMuralWorkspace === muralWorkspace
        break
      case 'company':
        isUserPermitted = paletteMuralCompany && paletteMuralCompany === muralCompany
        break
    }
  }

  if (!isUserPermitted) {
    return { error: 'You do not have access to this palette' }
  }

  return currentPalette
}

module.exports = { getPalettesByUser, getPaletteByUser }
const { getUser } = require('../helpers/user')

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
Parse.Cloud.define('getOrCreateMuralUser', async request => {
  const params = request.params
  const { id, workspaceId, companyId } = params
  if (!id) return { error: 'Provide "id" to get or create a user' }

  const User = Parse.Object.extend('MuralUser')
  const query = new Parse.Query(User)
  query.equalTo('muralUsername', id)
  const user = await query.first()
  if (!!user) return { result: user }

  const newUserInstance = new User()
  try {
    const newUser = await newUserInstance.save({ muralUsername: id, muralWorkspace: workspaceId, muralCompany: companyId })
    return { result: newUser }
  } catch (e) {
    return { error: e }
  }
})
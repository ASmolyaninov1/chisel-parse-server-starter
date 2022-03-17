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
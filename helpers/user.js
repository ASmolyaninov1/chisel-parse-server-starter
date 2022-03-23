const getUser = (muralUsername) => {
  const MuralUser = Parse.Object.extend("MuralUser")
  const userQuery = new Parse.Query(MuralUser)
  userQuery.equalTo('muralUsername', muralUsername)
  return userQuery.first()
}

module.exports = { getUser }
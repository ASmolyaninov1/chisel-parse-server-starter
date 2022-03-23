const { getUser } = require("../helpers/user")

async function authCheck(req, res, next) {
  const requestUrl = req.url
  if (requestUrl === '/getOrCreateMuralUser') {
    next()
  } else {
    const headers = req.headers
    const { username } = headers
    if (!username) {
      res.status(401)
      res.send({ error: 'Provide "username" in headers' })
      return
    }
    const user = await getUser(username)
    if (!user) {
      res.status(401)
      res.send({ error: 'User not found' })
    } else {
      req.headers.user = user
      next()
    }
  }
}

module.exports = authCheck

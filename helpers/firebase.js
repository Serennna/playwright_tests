// helpers/firebase.js
const axios = require('axios')

const FIREBASE_API_KEY = 'AIzaSyCpZlq-Gxqhh3T-eQC33vVMbNFGqhSu8kg'

async function firebaseLogin(email, password) {
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCpZlq-Gxqhh3T-eQC33vVMbNFGqhSu8kg`
  console.log('🔑 Firebase 登录 URL：', url)
  console.log('🔑 Firebase 登录 Email：', email)
  console.log('🔑 Firebase 登录 Password：', password)

  const res = await axios.post(url, {
    clientType: 'CLIENT_TYPE_WEB',
    email,
    password,
    returnSecureToken: true
  })

  const { idToken, refreshToken, localId } = res.data
  console.log('🔑 Firebase 登录成功, idToken 片段：', idToken.slice(0, 30) + '...')
  return { idToken, refreshToken, localId }
}

async function callProtectedApi(idToken, endpoint, method = 'GET', body = null) {
  const res = await axios({
    url: endpoint,
    method,
    headers: {
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json'
    },
    data: body
  })

  return res
}

module.exports = {
  firebaseLogin,
  callProtectedApi
}

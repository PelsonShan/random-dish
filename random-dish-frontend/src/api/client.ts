import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json', 'X-User-Id': '1' },
})

api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
)

export default api

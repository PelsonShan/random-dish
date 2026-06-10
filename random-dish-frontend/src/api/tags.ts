import api from './client'
import type { TagInfo } from './dishes'

export const tagsApi = {
  list: () => api.get('/tags'),
}

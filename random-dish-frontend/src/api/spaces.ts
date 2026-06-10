import api from './client'

export interface SpaceInfo {
  id: number
  name: string
  inviteCode: string
  ownerId: number
  ownerName: string
  memberCount: number
  members: MemberInfo[]
  createdAt: string
}

export interface MemberInfo {
  userId: number
  username: string
  nickname: string
  role: string
}

export const spacesApi = {
  list: () => api.get('/spaces'),
  create: (name: string) => api.post('/spaces', { name }),
  join: (inviteCode: string) => api.post('/spaces/join', { inviteCode }),
  detail: (id: number) => api.get(`/spaces/${id}`),
}

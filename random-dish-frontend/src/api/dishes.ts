import api from './client'

export interface DishInfo {
  id: number
  name: string
  imageUrl: string | null
  mealType: string
  mealTypeLabel: string
  creatorName: string
  tags: TagInfo[]
  createdAt: string
  updatedAt: string
}

export interface TagInfo {
  id: number
  name: string
  category: string
}

export interface DishFormData {
  name: string
  imageUrl?: string
  mealTypes?: string[]
  tagIds?: number[]
}

export const dishesApi = {
  list: (spaceId: number, params?: { mealType?: string; tagIds?: string }) =>
    api.get(`/spaces/${spaceId}/dishes`, { params }),
  create: (spaceId: number, data: DishFormData) =>
    api.post(`/spaces/${spaceId}/dishes`, data),
  update: (spaceId: number, dishId: number, data: DishFormData) =>
    api.put(`/spaces/${spaceId}/dishes/${dishId}`, data),
  delete: (spaceId: number, dishId: number) =>
    api.delete(`/spaces/${spaceId}/dishes/${dishId}`),
}

import api from './client'
import type { DishInfo } from './dishes'

export interface RecommendParams {
  mealType?: string
  tagIds?: number[]
  pattern?: string
}

export interface MultiRecommendResponse {
  pattern: string
  dishes: DishInfo[]
  summary: string
}

export const recommendApi = {
  get: (spaceId: number, params?: RecommendParams) =>
    api.post(`/spaces/${spaceId}/recommend`, params || {}),
  history: (spaceId: number) =>
    api.get(`/spaces/${spaceId}/history`),
}

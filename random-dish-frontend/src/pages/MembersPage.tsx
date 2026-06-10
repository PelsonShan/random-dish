import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { spacesApi, type SpaceInfo } from '@/api/spaces'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Crown, User, ChevronLeft } from 'lucide-react'

export function MembersPage() {
  const { id } = useParams<{ id: string }>()
  const spaceId = Number(id)
  const [space, setSpace] = useState<SpaceInfo | null>(null)
  const [loading, setLoading] = useState(true)

  if (isNaN(spaceId)) {
    return <div className="text-center py-12"><p className="text-gray-500">无效的空间ID</p>
      <Link to="/spaces" className="text-primary-600 hover:underline mt-2 block">返回空间列表</Link></div>
  }

  useEffect(() => {
    spacesApi.detail(spaceId).then(r => setSpace(r.data.data)).finally(() => setLoading(false))
  }, [spaceId])

  if (loading) return <div className="text-center py-12 text-gray-500">加载中...</div>
  if (!space) return <div className="text-center py-12 text-gray-500">空间不存在</div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to={`/spaces/${spaceId}`} className="text-gray-400 hover:text-gray-600">
          <ChevronLeft className="w-6 h-6" /></Link>
        <h2 className="text-2xl font-bold text-gray-900">成员管理</h2>
      </div>
      <div className="text-sm text-gray-500 mb-4">
        邀请码：<code className="bg-gray-100 px-2 py-0.5 rounded">{space.inviteCode}</code>
      </div>
      <div className="space-y-3">
        {space.members.map(m => (
          <Card key={m.userId}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600" /></div>
                <div><p className="font-medium text-gray-900">{m.nickname || m.username}</p>
                  <p className="text-xs text-gray-400">@{m.username}</p></div>
              </div>
              <Badge variant={m.role === 'ADMIN' ? 'default' : 'outline'}>
                {m.role === 'ADMIN' ? <span className="flex items-center gap-1"><Crown className="w-3 h-3" />管理员</span> : '成员'}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

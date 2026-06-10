import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { spacesApi, type SpaceInfo } from '@/api/spaces'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'
import { Plus, Users, Copy, UtensilsCrossed, Soup, ChefHat } from 'lucide-react'

const CARD_GRADIENTS = [
  'from-orange-400 to-red-500',
  'from-amber-400 to-orange-500',
  'from-yellow-400 to-amber-500',
  'from-green-400 to-emerald-500',
  'from-teal-400 to-cyan-500',
  'from-blue-400 to-indigo-500',
  'from-purple-400 to-pink-500',
  'from-rose-400 to-red-500',
]

const CARD_ICONS = [UtensilsCrossed, Soup, ChefHat, UtensilsCrossed, Soup, ChefHat, UtensilsCrossed, Soup]

export function SpaceListPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [spaces, setSpaces] = useState<SpaceInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [newName, setNewName] = useState('')
  const [inviteCode, setInviteCode] = useState('')

  useEffect(() => { loadSpaces() }, [])
  const loadSpaces = async () => {
    try { setSpaces((await spacesApi.list()).data.data) } catch {} finally { setLoading(false) }
  }

  const handleCreate = async () => {
    if (!newName.trim()) return
    try { await spacesApi.create(newName.trim()); setShowCreate(false); setNewName(''); showToast('success','创建成功'); loadSpaces() }
    catch (err: any) { showToast('error', err.response?.data?.message || '创建失败') }
  }

  const handleJoin = async () => {
    if (!inviteCode.trim()) return
    try { await spacesApi.join(inviteCode.trim()); setShowJoin(false); setInviteCode(''); showToast('success','加入成功'); loadSpaces() }
    catch (err: any) { showToast('error', err.response?.data?.message || '加入失败') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-1">今天吃啥呀</h2>
          <p className="text-gray-500 text-sm">选择一个空间，开始随机吧</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowJoin(true)}>加入空间</Button>
          <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-1" />创建空间</Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-48 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : spaces.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🍳</div>
          <p className="text-gray-500 text-lg mb-2">还没有空间</p>
          <p className="text-gray-400 text-sm mb-6">创建一个空间，或者通过邀请码加入吧</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setShowJoin(true)}>加入空间</Button>
            <Button onClick={() => setShowCreate(true)}><Plus className="w-4 h-4 mr-1" />创建空间</Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {spaces.map((space, i) => {
            const Icon = CARD_ICONS[i % CARD_ICONS.length]
            const gradient = CARD_GRADIENTS[i % CARD_GRADIENTS.length]
            return (
              <div key={space.id}
                onClick={() => navigate(`/spaces/${space.id}`)}
                className="group relative h-48 rounded-2xl overflow-hidden cursor-pointer
                           shadow-md hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300">
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-90
                                group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                <div className="relative h-full p-5 flex flex-col justify-between text-white">
                  <div className="flex items-start justify-between">
                    <Icon className="w-8 h-8 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                    <span className="text-xs opacity-70 bg-white/20 rounded-full px-2 py-0.5">
                      {space.memberCount} 人</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-1 group-hover:scale-105 transition-transform duration-300 origin-left">
                      {space.name}</h3>
                    <div className="flex items-center gap-2 text-xs opacity-75">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" />{space.ownerName}</span>
                      <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(space.inviteCode); showToast('success','已复制') }}
                        className="flex items-center gap-0.5 bg-white/20 hover:bg-white/30 rounded px-1.5 py-0.5 transition-colors">
                        <Copy className="w-3 h-3" />{space.inviteCode}</button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Dialog open={showCreate} onClose={() => setShowCreate(false)} title="创建空间">
        <div className="space-y-4">
          <Input placeholder="空间名称" value={newName} onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()} />
          <Button className="w-full" onClick={handleCreate}>创建</Button>
        </div>
      </Dialog>

      <Dialog open={showJoin} onClose={() => setShowJoin(false)} title="加入空间">
        <div className="space-y-4">
          <Input placeholder="6位邀请码" value={inviteCode}
            onChange={e => setInviteCode(e.target.value.toUpperCase())} maxLength={6}
            onKeyDown={e => e.key === 'Enter' && handleJoin()} />
          <Button className="w-full" onClick={handleJoin}>加入</Button>
        </div>
      </Dialog>
    </div>
  )
}

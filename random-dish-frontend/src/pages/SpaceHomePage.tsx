import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { recommendApi, type MultiRecommendResponse } from '@/api/recommend'
import { type DishInfo, type TagInfo } from '@/api/dishes'
import { tagsApi } from '@/api/tags'
import { spacesApi, type SpaceInfo } from '@/api/spaces'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import { ChefHat, Dices, RefreshCw, History, Utensils, ChevronLeft, DoorOpen } from 'lucide-react'

const PATTERNS = [
  { key: 'single', label: '单菜' },
  { key: 'one_one', label: '一菜一汤' },
  { key: 'two_one', label: '两菜一汤' },
  { key: 'three_one', label: '三菜一汤' },
]

export function SpaceHomePage() {
  const { id } = useParams<{ id: string }>()
  const spaceId = Number(id)
  const { showToast } = useToast()
  const resultRef = useRef<HTMLDivElement>(null)

  const [space, setSpace] = useState<SpaceInfo | null>(null)
  const [tags, setTags] = useState<TagInfo[]>([])
  const [result, setResult] = useState<DishInfo[] | null>(null)
  const [multiResult, setMultiResult] = useState<MultiRecommendResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<DishInfo[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const [mealType, setMealType] = useState('')
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [pattern, setPattern] = useState('single')

  if (isNaN(spaceId))
    return <div className="text-center py-12"><p className="text-gray-500">无效的空间ID</p><Link to="/spaces" className="text-primary-600 hover:underline mt-2 block">返回空间列表</Link></div>

  useEffect(() => {
    Promise.all([
      spacesApi.detail(spaceId).then(r => setSpace(r.data.data)).catch(() => {}),
      tagsApi.list().then(r => setTags(r.data.data)).catch(() => {}),
      loadHistory(),
    ])
  }, [spaceId])

  const loadHistory = async () => {
    try { setHistory((await recommendApi.history(spaceId)).data.data || []) } catch {}
  }

  const handleRecommend = async () => {
    setLoading(true); setResult(null); setMultiResult(null)
    try {
      const params: any = {}
      if (mealType) params.mealType = mealType
      if (selectedTags.length) params.tagIds = selectedTags
      if (pattern !== 'single') params.pattern = pattern
      const res = await recommendApi.get(spaceId, params)
      if (res.data.data?.pattern) { setMultiResult(res.data.data); setResult(res.data.data.dishes) }
      else setResult([res.data.data])
      loadHistory()
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    } catch (err: any) {
      showToast('error', err.response?.data?.message || '推荐失败，请检查菜品库')
    } finally { setLoading(false) }
  }

  const groupedTags = tags.reduce((acc, t) => {
    (acc[t.category] = acc[t.category] || []).push(t); return acc
  }, {} as Record<string, TagInfo[]>)

  return (
    <div className="max-w-2xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Link to="/spaces" className="text-gray-400 hover:text-gray-600"><ChevronLeft className="w-5 h-5" /></Link>
          <h2 className="text-lg font-bold text-gray-900">{space?.name || '...'}</h2>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => setShowHistory(!showHistory)}><History className="w-4 h-4" /></Button>
          <Link to={`/spaces/${spaceId}/dishes`}><Button variant="ghost" size="sm"><Utensils className="w-4 h-4" /></Button></Link>
        </div>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <div className="flex items-center gap-1.5 mb-3">
          <ChefHat className="w-4 h-4 text-primary-500" />
          <span className="text-sm font-medium text-gray-700">今天吃啥呀？</span>
        </div>

        {/* Meal type + Pattern in one row */}
        <div className="flex gap-2 mb-2">
          <select value={mealType} onChange={e => setMealType(e.target.value)}
            className="flex-1 h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs">
            <option value="">不限餐段</option>
            <option value="BREAKFAST">🌅 早餐</option>
            <option value="LUNCH">☀️ 午餐</option>
            <option value="DINNER">🌙 晚餐</option>
          </select>
          <div className="flex gap-1">
            {PATTERNS.map(p => (
              <button key={p.key} onClick={() => setPattern(p.key)}
                className={`px-2 py-1 text-xs rounded-lg border transition-colors ${
                  pattern === p.key ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                }`}>{p.label}</button>
            ))}
          </div>
        </div>

        {/* Tags - expandable */}
        <div className="mb-2">
          <button onClick={() => setShowFilters(!showFilters)}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 py-1">
            标签筛选 {showFilters ? '▲' : '▼'}
          </button>
          {showFilters && Object.entries(groupedTags).map(([cat, items]) => (
            <div key={cat} className="mt-1.5">
              <p className="text-sm text-gray-500 mb-1">{cat}</p>
              <div className="flex flex-wrap gap-2">
                {items.map(t => (
                  <Badge key={t.id} variant={selectedTags.includes(t.id) ? 'default' : 'outline'}
                    className="text-sm px-3 py-1.5 cursor-pointer select-none"
                    onClick={() => setSelectedTags(p => p.includes(t.id) ? p.filter(x => x !== t.id) : [...p, t.id])}>
                    {t.name}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Random button */}
        <Button size="lg" className="w-full h-12 text-base" onClick={handleRecommend} disabled={loading}>
          {loading ? <RefreshCw className="w-5 h-5 mr-2 animate-spin" /> : <Dices className="w-5 h-5 mr-2" />}
          {loading ? '正在随机...' : '随机一个！'}
        </Button>
      </div>

      {/* Results */}
      <div ref={resultRef}>
        {result && result.length > 0 && (
          <div className="space-y-3 mb-4">
            <p className="text-base font-semibold text-primary-600 text-center">
              🎉 {multiResult?.summary || '就决定是你了！'}
            </p>

            {/* 出去吃 popup */}
            {result.filter((d: any) => d.id === -1).length > 0 && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
                   onClick={() => { setResult(null); setMultiResult(null) }}>
                <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full mx-4 text-center"
                     onClick={e => e.stopPropagation()}>
                  <div className="text-6xl mb-4 animate-bounce">🍽️</div>
                  <DoorOpen className="w-12 h-12 mx-auto text-primary-500 mb-3" />
                  <h2 className="text-3xl font-bold text-primary-600 mb-3">出去吃！</h2>
                  <p className="text-gray-500 mb-2">今晚别做饭了</p>
                  <p className="text-gray-400 text-sm mb-6">出去搓一顿吧 🍻</p>
                  <div className="flex justify-center gap-2 text-2xl mb-6">
                    {['🍜','🍕','🍣','🥘','🍲'].map((e,i) => (
                      <span key={i} className="animate-pulse" style={{animationDelay: `${i*0.2}s`}}>{e}</span>
                    ))}
                  </div>
                  <Button variant="outline" onClick={() => { setResult(null); setMultiResult(null) }}>知道了</Button>
                </div>
              </div>
            )}

            {/* Dish cards */}
            {result.filter((d: any) => d.id !== -1).length > 0 && (
              <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                {result.filter((d: any) => d.id !== -1).map((d, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 text-center">
                    {d.imageUrl && <img src={d.imageUrl} alt={d.name} className="h-28 w-full object-cover rounded-lg mb-2" />}
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{d.name}</h3>
                    <div className="flex justify-center gap-1 flex-wrap">
                      <Badge className="text-xs">{d.mealTypeLabel}</Badge>
                      {d.tags.map(t => <Badge key={t.id} variant="outline" className="text-xs">{t.name}</Badge>)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="text-center">
              <Button variant="outline" size="sm" onClick={handleRecommend}><RefreshCw className="w-3 h-3 mr-1" />不满意，再来</Button>
            </div>
          </div>
        )}
      </div>

      {/* History */}
      {showHistory && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">最近推荐</h3>
          {history.length === 0 ? <p className="text-xs text-gray-400">暂无记录</p>
          : <div className="space-y-1.5">
            {history.slice(0, 10).map((dish, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <span className="text-base">{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '📌'}</span>
                <span className="font-medium text-gray-800">{dish.name}</span>
                <Badge variant="outline" className="text-xs">{dish.mealTypeLabel}</Badge>
              </div>
            ))}
          </div>}
        </div>
      )}
    </div>
  )
}

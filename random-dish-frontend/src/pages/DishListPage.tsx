import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { dishesApi, type DishInfo, type TagInfo } from '@/api/dishes'
import { tagsApi } from '@/api/tags'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'
import { Plus, Pencil, Trash2, Search, Upload, ChevronLeft, Camera, X } from 'lucide-react'

const MEAL_OPTIONS = [
  { value: 'BREAKFAST', label: '🌅 早餐' },
  { value: 'LUNCH', label: '☀️ 午餐' },
  { value: 'DINNER', label: '🌙 晚餐' },
]

export function DishListPage() {
  const { id } = useParams<{ id: string }>()
  const spaceId = Number(id)
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [dishes, setDishes] = useState<DishInfo[]>([])
  const [tags, setTags] = useState<TagInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterMealType, setFilterMealType] = useState('')
  const [filterTagIds, setFilterTagIds] = useState<number[]>([])

  const [showForm, setShowForm] = useState(false)
  const [editDish, setEditDish] = useState<DishInfo | null>(null)
  const [formName, setFormName] = useState('')
  const [formImageUrl, setFormImageUrl] = useState('')
  const [formMealTypes, setFormMealTypes] = useState<string[]>([])
  const [formTagIds, setFormTagIds] = useState<number[]>([])
  const [uploading, setUploading] = useState(false)
  const [showDelete, setShowDelete] = useState<DishInfo | null>(null)

  if (isNaN(spaceId)) {
    return <div className="text-center py-12"><p className="text-gray-500">无效的空间ID</p>
      <Link to="/spaces" className="text-primary-600 hover:underline mt-2 block">返回空间列表</Link></div>
  }

  useEffect(() => {
    const init = async () => {
      try {
        const [tagsRes] = await Promise.all([tagsApi.list(), loadDishes()])
        setTags(tagsRes.data.data)
      } catch (e: any) {
        showToast('error', '加载失败: ' + (e?.response?.data?.message || e?.message || '请确认后端已启动'))
      }
    }
    init()
  }, [])

  const loadDishes = async () => {
    setLoading(true)
    try {
      const params: any = {}
      if (filterMealType) params.mealType = filterMealType
      if (filterTagIds.length) params.tagIds = filterTagIds.join(',')
      const res = await dishesApi.list(spaceId, params)
      setDishes(res.data.data)
    } finally { setLoading(false) }
  }

  const toggleFilterTag = (id: number) =>
    setFilterTagIds(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  const openCreate = () => {
    setEditDish(null); setFormName(''); setFormImageUrl('')
    setFormMealTypes([]); setFormTagIds([]); setShowForm(true)
  }

  const openEdit = (dish: DishInfo) => {
    setEditDish(dish); setFormName(dish.name); setFormImageUrl(dish.imageUrl || '')
    setFormMealTypes(dish.mealType ? dish.mealType.split(',') : [])
    setFormTagIds(dish.tags.map(t => t.id)); setShowForm(true)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (json.success) setFormImageUrl(json.data.url)
    } catch { showToast('error', '上传失败') }
    finally { setUploading(false) }
  }

  const handleSave = async () => {
    if (!formName.trim()) return
    const data: any = { name: formName.trim(), imageUrl: formImageUrl || null }
    data.mealTypes = formMealTypes.length > 0 ? formMealTypes : undefined
    data.tagIds = formTagIds
    try {
      if (editDish) await dishesApi.update(spaceId, editDish.id, data)
      else await dishesApi.create(spaceId, data)
      showToast('success', editDish ? '已更新' : '已添加')
      setShowForm(false); loadDishes()
    } catch (err: any) {
      showToast('error', err.response?.data?.message || '保存失败')
    }
  }

  const handleDelete = async () => {
    if (!showDelete) return
    try { await dishesApi.delete(spaceId, showDelete.id); showToast('success', '已删除'); setShowDelete(null); loadDishes() }
    catch (err: any) { showToast('error', err.response?.data?.message || '删除失败') }
  }

  const filtered = search ? dishes.filter(d => d.name.toLowerCase().includes(search.toLowerCase())) : dishes

  const groupedTags = tags.reduce((acc, t) => {
    (acc[t.category] = acc[t.category] || []).push(t); return acc
  }, {} as Record<string, TagInfo[]>)

  const mealLabel = (t: string | undefined) => {
    if (!t) return '不限'
    return t.split(',').map(m => MEAL_OPTIONS.find(o => o.value === m)?.label || m).join('、')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Link to={isNaN(spaceId) ? "/spaces" : `/spaces/${spaceId}`} className="text-gray-400 hover:text-gray-600 mr-3">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">菜品管理</h2>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-1" />添加菜品</Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 space-y-3">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input className="pl-9" placeholder="搜索菜品..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select value={filterMealType} onChange={e => { setFilterMealType(e.target.value); loadDishes() }}
            className="h-10 w-32 rounded-lg border border-gray-300 bg-white px-3 text-sm">
            <option value="">全部餐段</option>
            {MEAL_OPTIONS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        {Object.entries(groupedTags).map(([cat, items]) => (
          <div key={cat} className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400 w-10">{cat}</span>
            {items.map(t => (
              <Badge key={t.id} variant={filterTagIds.includes(t.id) ? 'default' : 'outline'}
                onClick={() => toggleFilterTag(t.id)}>{t.name}</Badge>
            ))}
          </div>
        ))}
      </div>

      {/* Dish list */}
      {loading ? <div className="text-center py-12 text-gray-500">加载中...</div>
      : filtered.length === 0 ? <div className="text-center py-12"><p className="text-gray-500">还没有菜品</p></div>
      : <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
        {filtered.map(dish => (
          <Card key={dish.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{dish.name}</h3>
                  {dish.imageUrl && (
                    <img src={dish.imageUrl} alt={dish.name}
                      className="mt-2 h-24 w-full object-cover rounded-lg" />
                  )}
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <Badge variant="outline">{mealLabel(dish.mealType)}</Badge>
                    {dish.tags.map(t => <Badge key={t.id}>{t.name}</Badge>)}
                  </div>
                </div>
                <div className="flex gap-1 ml-2">
                  <button onClick={() => openEdit(dish)} className="p-1.5 text-gray-400 hover:text-primary-600 rounded">
                    <Pencil className="w-4 h-4" /></button>
                  <button onClick={() => setShowDelete(dish)} className="p-1.5 text-gray-400 hover:text-red-600 rounded">
                    <Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>}

      {/* Form Dialog */}
      <Dialog open={showForm} onClose={() => setShowForm(false)} title={editDish ? '编辑菜品' : '添加菜品'}>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">名称</label>
            <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="菜品名称" className="mt-1" />
          </div>

          {/* Image upload */}
          <div>
            <label className="text-sm font-medium text-gray-700">图片</label>
            <div className="mt-1 space-y-2">
              {formImageUrl && (
                <div className="relative inline-block">
                  <img src={formImageUrl} alt="预览" className="h-32 rounded-lg object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  <button onClick={() => setFormImageUrl('')}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5">
                    <X className="w-3 h-3" /></button>
                </div>
              )}
              <div className="flex gap-2">
                <input type="file" ref={fileInputRef} accept="image/*" capture="environment"
                  onChange={handleUpload} className="hidden" />
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  <Upload className="w-4 h-4 mr-1" />{uploading ? '上传中...' : '选择图片'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  <Camera className="w-4 h-4 mr-1" />拍照
                </Button>
              </div>
              <p className="text-xs text-gray-400">也支持直接粘贴图片URL:</p>
              <Input value={formImageUrl} onChange={e => setFormImageUrl(e.target.value)} placeholder="https://..." />
            </div>
          </div>

          {/* Multi-select meal types */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">适用餐段</label>
            <div className="flex gap-3 flex-wrap">
              {MEAL_OPTIONS.map(m => (
                <label key={m.value} className="flex items-center gap-1 text-sm cursor-pointer">
                  <input type="checkbox" checked={formMealTypes.includes(m.value)}
                    onChange={() => setFormMealTypes(p => p.includes(m.value) ? p.filter(x => x !== m.value) : [...p, m.value])}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  {m.label}
                </label>
              ))}
            </div>
          </div>

          {/* Tags */}
          {Object.entries(groupedTags).map(([cat, items]) => (
            <div key={cat}>
              <p className="text-sm font-medium text-gray-700 mb-1">{cat}</p>
              <div className="flex flex-wrap gap-2">
                {items.map(t => (
                  <Badge key={t.id} variant={formTagIds.includes(t.id) ? 'default' : 'outline'}
                    onClick={() => setFormTagIds(p => p.includes(t.id) ? p.filter(x => x !== t.id) : [...p, t.id])}>
                    {t.name}</Badge>
                ))}
              </div>
            </div>
          ))}
          <Button className="w-full" onClick={handleSave}>保存</Button>
        </div>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!showDelete} onClose={() => setShowDelete(null)} title="确认删除">
        <p className="text-gray-600 mb-4">确定要删除「{showDelete?.name}」吗？</p>
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setShowDelete(null)}>取消</Button>
          <Button variant="danger" onClick={handleDelete}>删除</Button>
        </div>
      </Dialog>
    </div>
  )
}

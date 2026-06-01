// 菜品管理页面 — 替代 pages/manage/manage.js + manage.wxml

import { HOT_DISHES } from '../data.js';
import { getMyDishes, saveMyDishes, STORAGE_KEY } from '../storage.js';
import { showToast, showModal, vibrate } from '../utils.js';

const CATEGORY_LABELS = { meat: '荤菜', veggie: '素菜', noodle: '主食', soup: '汤品' };
const CATEGORY_ORDER = ['meat', 'veggie', 'noodle', 'soup'];

let state = {
  dishes: [],
  grouped: [],
  hotDishes: HOT_DISHES,
  hotFilter: 'all',
  adding: false,
  form: { name: '', emoji: '', category: 'meat', desc: '', image: '' },
  _idCounter: 0
};

function loadDishes() {
  state.dishes = getMyDishes();
  state._idCounter = state.dishes.reduce((max, d) => Math.max(max, d.id || 0), 0);
  state.grouped = groupByCategory(state.dishes);
}

function groupByCategory(dishes) {
  return CATEGORY_ORDER.map(cat => ({
    label: CATEGORY_LABELS[cat],
    key: cat,
    items: dishes.filter(d => d.category === cat)
  })).filter(g => g.items.length);
}

function filterHotDishes() {
  state.hotDishes = state.hotFilter === 'all'
    ? HOT_DISHES
    : HOT_DISHES.filter(d => d.category === state.hotFilter);
}

function addDish() {
  if (!state.form.name.trim()) {
    showToast('请输入菜名', 'none');
    return;
  }
  const newDish = {
    id: state._idCounter + 1,
    name: state.form.name.trim(),
    emoji: state.form.emoji || '🍽️',
    desc: state.form.desc || '暂无描述',
    category: state.form.category,
    image: state.form.image || ''
  };
  state.dishes = [...state.dishes, newDish];
  saveMyDishes(state.dishes);
  state._idCounter++;
  state.grouped = groupByCategory(state.dishes);
  state.form = { name: '', emoji: '', category: 'meat', desc: '', image: '' };
  state.adding = false;
  showToast('添加成功', 'success');
  render();
}

function addPopular(index) {
  const dish = state.hotDishes[index];
  if (state.dishes.some(d => d.name === dish.name)) {
    showToast(`${dish.name} 已存在`, 'none');
    return;
  }
  const newDish = { id: state._idCounter + 1, ...dish, image: '' };
  state.dishes = [...state.dishes, newDish];
  saveMyDishes(state.dishes);
  state._idCounter++;
  state.grouped = groupByCategory(state.dishes);
  showToast(`已添加 ${dish.name}`, 'success');
  vibrate(20);
  render();
}

async function deleteDish(id) {
  const confirmed = await showModal('确认删除', '确定要删除这道菜吗？');
  if (!confirmed) return;
  state.dishes = state.dishes.filter(d => d.id !== id);
  saveMyDishes(state.dishes);
  state.grouped = groupByCategory(state.dishes);
  render();
}

function processImage(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    // 压缩图片到 200px 宽
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxW = 200;
      const scale = maxW / img.width;
      canvas.width = maxW;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
      state.form.image = dataUrl;
      renderForm();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// ---- 渲染 ----
function render() {
  renderHotFilter();
  renderHotList();
  renderForm();
  renderDishList();
  renderAddBtn();
}

function renderHotFilter() {
  const el = document.getElementById('manage-hot-filter');
  if (!el) return;
  const cats = ['all', 'meat', 'veggie', 'noodle', 'soup'];
  const labels = { all: '全部', meat: '荤菜', veggie: '素菜', noodle: '主食', soup: '汤品' };
  el.innerHTML = cats.map(c =>
    `<button class="hot-filter-btn ${state.hotFilter === c ? 'active' : ''}" data-filter="${c}">${labels[c]}</button>`
  ).join('');
}

function renderHotList() {
  const el = document.getElementById('manage-hot-list');
  if (!el) return;
  el.innerHTML = state.hotDishes.map((d, i) => `
    <div class="popular-item" data-index="${i}">
      <span class="pop-emoji">${d.emoji}</span>
      <span class="pop-name">${d.name}</span>
      <span class="pop-add">+</span>
    </div>`).join('');
}

function renderAddBtn() {
  const el = document.getElementById('manage-add-btn');
  if (!el) return;
  el.innerHTML = state.adding ? '收起' : '+ 自定义菜品';
}

function renderForm() {
  const el = document.getElementById('manage-form');
  if (!el) return;
  if (!state.adding) { el.innerHTML = ''; return; }
  el.innerHTML = `
    <div class="img-section">
      <div class="img-picker">
        ${state.form.image
          ? `<img class="preview-img" src="${state.form.image}" alt="预览" />`
          : `<div class="img-placeholder"><span class="img-icon">📷</span><span class="img-hint">上传菜品图片</span></div>`}
      </div>
      <div class="img-actions">
        <label class="img-btn"><span class="img-btn-icon">📸</span><span class="img-btn-text">拍照</span><input type="file" accept="image/*" capture="camera" class="file-input" /></label>
        <label class="img-btn"><span class="img-btn-icon">🖼️</span><span class="img-btn-text">相册</span><input type="file" accept="image/*" class="file-input" /></label>
      </div>
    </div>
    <input class="input" placeholder="菜名（必填）" value="${escapeHtml(state.form.name)}" data-field="name" />
    <input class="input" placeholder="Emoji（如 🍗，可选）" value="${escapeHtml(state.form.emoji)}" data-field="emoji" maxlength="2" />
    <input class="input" placeholder="一句话描述（可选）" value="${escapeHtml(state.form.desc)}" data-field="desc" />
    <div class="cat-row">
      <span class="cat-label">分类</span>
      ${['meat','veggie','noodle','soup'].map(c =>
        `<button class="cat-btn ${state.form.category === c ? 'active' : ''}" data-cat="${c}">${CATEGORY_LABELS[c]}</button>`
      ).join('')}
    </div>
    <button class="btn-confirm" id="manage-form-confirm">确认添加</button>
  `;
}

function renderDishList() {
  const el = document.getElementById('manage-dish-list');
  if (!el) return;
  if (!state.grouped.length) {
    el.innerHTML = `<div class="empty"><span class="empty-icon">🍽️</span><span class="empty-text">还没有菜品</span><span class="empty-hint">从热门菜品快速添加，或自定义创建</span></div>`;
    return;
  }
  el.innerHTML = state.grouped.map(g => `
    <div class="section">
      <div class="section-header"><span class="section-title">${g.label}</span><span class="section-count">${g.items.length}道</span></div>
      <div class="dish-list">
        ${g.items.map(d => `
          <div class="dish-item">
            ${d.image ? `<img class="item-img" src="${d.image}" alt="${d.name}" />` : `<span class="item-emoji">${d.emoji}</span>`}
            <div class="item-body"><span class="item-name">${d.name}</span><span class="item-desc">${d.desc}</span></div>
            <button class="btn-del" data-del-id="${d.id}"><span class="del-icon">✕</span></button>
          </div>`).join('')}
      </div>
    </div>`).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---- 事件委托 ----
function setupEvents() {
  // 热门分类筛选
  document.getElementById('manage-hot-filter').addEventListener('click', (e) => {
    const btn = e.target.closest('.hot-filter-btn');
    if (btn) {
      state.hotFilter = btn.dataset.filter;
      filterHotDishes();
      render();
    }
  });

  // 热门菜品点击添加
  document.getElementById('manage-hot-list').addEventListener('click', (e) => {
    const item = e.target.closest('.popular-item');
    if (item) addPopular(parseInt(item.dataset.index));
  });

  // 添加按钮
  document.getElementById('manage-add-btn').addEventListener('click', () => {
    state.adding = !state.adding;
    if (!state.adding) state.form = { name: '', emoji: '', category: 'meat', desc: '', image: '' };
    render();
  });

  // 表单 - 图片上传 / 输入 / 分类 / 确认
  document.getElementById('manage-form').addEventListener('click', (e) => {
    const btn = e.target.closest('#manage-form-confirm');
    if (btn) { addDish(); return; }
    const catBtn = e.target.closest('.cat-btn');
    if (catBtn) { state.form.category = catBtn.dataset.cat; renderForm(); }
  });
  document.getElementById('manage-form').addEventListener('input', (e) => {
    if (e.target.classList.contains('input') && e.target.dataset.field) {
      state.form[e.target.dataset.field] = e.target.value;
    }
  });
  document.getElementById('manage-form').addEventListener('change', (e) => {
    if (e.target.type === 'file' && e.target.files[0]) {
      processImage(e.target.files[0]);
    }
  });

  // 删除菜品
  document.getElementById('manage-dish-list').addEventListener('click', (e) => {
    const delBtn = e.target.closest('.btn-del');
    if (delBtn) deleteDish(parseInt(delBtn.dataset.delId));
  });
}

function init() {
  loadDishes();
  filterHotDishes();
  render();
  setupEvents();
}

export { init as initManagePage };

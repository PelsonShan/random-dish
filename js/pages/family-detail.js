// 家庭详情页面 — 替代 pages/family-detail/family-detail.js + family-detail.wxml

import { HOT_DISHES } from '../data.js';
import { showToast, showLoading, hideLoading, showModal, vibrate } from '../utils.js';
import { getFamilyDetail, addFamilyDish, deleteFamilyDish, manageMember } from '../services/family.js';
import { navigateBack } from '../app.js';

const CATEGORY_LABELS = { meat: '荤菜', veggie: '素菜', noodle: '主食', soup: '汤品' };
const CATEGORY_ORDER = ['meat', 'veggie', 'noodle', 'soup'];

let state = {
  familyId: '',
  familyName: '',
  inviteCode: '',
  myRole: '',
  myOpenId: '',
  currentTab: 'dishes',
  allDishes: [],
  groupedDishes: [],
  hotDishes: HOT_DISHES,
  hotFilter: 'all',
  adding: false,
  form: { name: '', emoji: '', category: 'meat', desc: '', image: '' },
  members: []
};

function loadAll() {
  const detail = getFamilyDetail(state.familyId);
  if (!detail) {
    showToast('家庭不存在', 'none');
    navigateBack();
    return;
  }
  state.inviteCode = detail.inviteCode;
  state.myRole = detail.myRole;
  state.myOpenId = detail.myOpenId;
  state.allDishes = detail.allDishes;
  state.groupedDishes = groupByCategory(state.allDishes);
  state.members = detail.members;
  state.familyName = detail.family.name;
}

function groupByCategory(dishes) {
  return CATEGORY_ORDER.map(cat => ({
    label: CATEGORY_LABELS[cat],
    key: cat,
    items: dishes.filter(d => d.category === cat)
  })).filter(g => g.items.length);
}

function filterHotDishes() {
  state.hotDishes = state.hotFilter === 'all' ? HOT_DISHES : HOT_DISHES.filter(d => d.category === state.hotFilter);
}

function addDish() {
  if (!state.form.name.trim()) { showToast('请输入菜名', 'none'); return; }
  addFamilyDish(state.familyId, {
    name: state.form.name.trim(),
    emoji: state.form.emoji || '🍽️',
    desc: state.form.desc || '暂无描述',
    category: state.form.category,
    image: state.form.image || ''
  });
  state.form = { name: '', emoji: '', category: 'meat', desc: '', image: '' };
  state.adding = false;
  loadAll();
  render();
  showToast('添加成功', 'success');
}

function addPopular(index) {
  const dish = state.hotDishes[index];
  if (state.allDishes.some(d => d.name === dish.name)) {
    showToast(`${dish.name} 已存在`, 'none');
    return;
  }
  addFamilyDish(state.familyId, {
    name: dish.name,
    emoji: dish.emoji,
    desc: dish.desc,
    category: dish.category,
    image: ''
  });
  loadAll();
  render();
  showToast(`已添加 ${dish.name}`, 'success');
  vibrate(20);
}

async function deleteDish(id) {
  const confirmed = await showModal('确认删除', '确定要删除这道菜吗？');
  if (!confirmed) return;
  deleteFamilyDish(id);
  loadAll();
  render();
}

async function handleManageMember(userId, action) {
  const res = manageMember(state.familyId, userId, action);
  if (res.success) {
    showToast('操作成功', 'success');
    loadAll();
    render();
  } else {
    showToast(res.error, 'none');
  }
}

async function leaveFamily() {
  const confirmed = await showModal('退出家庭', '确定要退出这个家庭吗？');
  if (!confirmed) return;
  const res = manageMember(state.familyId, state.myOpenId, 'leave');
  if (res.success) {
    showToast('已退出', 'success');
    setTimeout(() => navigateBack(), 1500);
  } else {
    showToast(res.error, 'none');
  }
}

function copyInviteCode() {
  navigator.clipboard.writeText(state.inviteCode).then(
    () => showToast('已复制', 'success'),
    () => showToast('复制失败', 'none')
  );
}

function processImage(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxW = 200;
      const scale = maxW / img.width;
      canvas.width = maxW;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      state.form.image = canvas.toDataURL('image/jpeg', 0.6);
      renderForm();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// ---- 渲染 ----
function render() {
  const el = document.getElementById('page-family-detail');
  if (!el) return;

  const isAdmin = state.myRole === 'owner' || state.myRole === 'admin';

  el.innerHTML = `
    ${isAdmin ? `
    <div class="invite-bar">
      <div class="invite-code">
        <span class="invite-label">邀请码</span>
        <span class="invite-value">${state.inviteCode}</span>
      </div>
      <div class="invite-actions">
        <button class="invite-btn" id="fd-copy-invite">📋 复制</button>
        <button class="invite-btn invite-share" id="fd-share">📤 分享</button>
      </div>
    </div>` : ''}

    <div class="tab-bar">
      <button class="tab ${state.currentTab === 'dishes' ? 'active' : ''}" data-tab="dishes">🍽️ 家庭菜单</button>
      <button class="tab ${state.currentTab === 'members' ? 'active' : ''}" data-tab="members">👥 成员 (${state.members.length})</button>
    </div>

    <div id="fd-tab-content"></div>
    <div id="fd-form-area"></div>
    <button class="btn-leave" id="fd-leave">退出家庭</button>
  `;

  if (state.currentTab === 'dishes') renderDishesTab();
  else renderMembersTab();
}

function renderDishesTab() {
  const el = document.getElementById('fd-tab-content');
  if (!el) return;

  const isAdmin = state.myRole === 'owner' || state.myRole === 'admin';

  el.innerHTML = `
    <div class="popular-section">
      <span class="section-label">🔥 热门菜品 · 一键添加</span>
      <div class="hot-filter-row" id="fd-hot-filter">
        ${['all','meat','veggie','noodle','soup'].map(c => {
          const labels = {all:'全部',meat:'荤菜',veggie:'素菜',noodle:'主食',soup:'汤品'};
          return `<button class="hot-filter-btn ${state.hotFilter === c ? 'active' : ''}" data-filter="${c}">${labels[c]}</button>`;
        }).join('')}
      </div>
      <div class="popular-scroll-row" id="fd-hot-list">
        ${state.hotDishes.map((d, i) => `
          <div class="popular-item" data-hot-idx="${i}">
            <span class="pop-emoji">${d.emoji}</span>
            <span class="pop-name">${d.name}</span>
            <span class="pop-add">+</span>
          </div>`).join('')}
      </div>
    </div>

    ${isAdmin ? `<div class="add-bar"><button class="btn-add" id="fd-toggle-add">${state.adding ? '收起' : '+ 自定义菜品'}</button></div>` : ''}

    <div id="fd-dish-list">
      ${state.groupedDishes.map(g => `
        <div class="section">
          <div class="section-header"><span class="section-title">${g.label}</span><span class="section-count">${g.items.length}道</span></div>
          <div class="dish-list">
            ${g.items.map(d => `
              <div class="dish-item">
                ${d.image ? `<img class="item-img" src="${d.image}" />` : `<span class="item-emoji">${d.emoji}</span>`}
                <div class="item-body"><span class="item-name">${d.name}</span><span class="item-desc">${d.desc}</span></div>
                ${isAdmin ? `<button class="btn-del" data-del-id="${d._id}"><span class="del-icon">✕</span></button>` : ''}
              </div>`).join('')}
          </div>
        </div>`).join('')}
    </div>
  `;

  if (state.adding) renderForm();
}

function renderMembersTab() {
  const el = document.getElementById('fd-tab-content');
  if (!el) return;

  const isOwner = state.myRole === 'owner';

  el.innerHTML = `
    <div class="member-list">
      ${state.members.map(m => `
        <div class="member-item">
          <span class="member-avatar">👤</span>
          <div class="member-info">
            <span class="member-name">${m.nickname || '匿名用户'}</span>
            <span class="member-role role-${m.role}">${m.role === 'owner' ? '创建者' : m.role === 'admin' ? '管理员' : '成员'}</span>
          </div>
          ${(isOwner && m.role !== 'owner') ? `
          <div class="member-actions">
            ${m.role === 'admin'
              ? `<button class="member-act-btn" data-action="revokeAdmin" data-uid="${m.userId}">取消管理</button>`
              : `<button class="member-act-btn" data-action="setAdmin" data-uid="${m.userId}">设为管理</button>`}
            <button class="member-act-btn danger" data-action="remove" data-uid="${m.userId}">移除</button>
          </div>` : ''}
        </div>`).join('')}
    </div>
  `;
}

function renderForm() {
  const el = document.getElementById('fd-form-area');
  if (!el) return;

  el.innerHTML = `
    <div class="add-form">
      <div class="img-section">
        <div class="img-picker">
          ${state.form.image
            ? `<img class="preview-img" src="${state.form.image}" />`
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
      <button class="btn-confirm" id="fd-form-confirm">确认添加</button>
    </div>
  `;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ---- 事件 ----
function setupEvents() {
  const page = document.getElementById('page-family-detail');
  if (!page) return;

  page.addEventListener('click', async (e) => {
    // Tab 切换
    const tab = e.target.closest('.tab');
    if (tab) { state.currentTab = tab.dataset.tab; render(); return; }

    // 热门分类
    const filterBtn = e.target.closest('#fd-hot-filter .hot-filter-btn');
    if (filterBtn) { state.hotFilter = filterBtn.dataset.filter; filterHotDishes(); renderDishesTab(); return; }

    // 热门菜品添加
    const hotItem = e.target.closest('#fd-hot-list .popular-item');
    if (hotItem) { addPopular(parseInt(hotItem.dataset.hotIdx)); return; }

    // 添加/收起
    if (e.target.matches('#fd-toggle-add')) { state.adding = !state.adding; render(); return; }

    // 表单确认
    if (e.target.matches('#fd-form-confirm')) { addDish(); return; }

    // 分类选择
    const catBtn = e.target.closest('.cat-btn');
    if (catBtn) { state.form.category = catBtn.dataset.cat; renderForm(); return; }

    // 删除菜品
    const delBtn = e.target.closest('.btn-del');
    if (delBtn) { deleteDish(delBtn.dataset.delId); return; }

    // 复制邀请码
    if (e.target.matches('#fd-copy-invite')) { copyInviteCode(); return; }

    // 分享（显示邀请码消息）
    if (e.target.matches('#fd-share')) { showToast('邀请码: ' + state.inviteCode, 'none'); return; }

    // 成员管理
    const actBtn = e.target.closest('.member-act-btn');
    if (actBtn) { handleManageMember(actBtn.dataset.uid, actBtn.dataset.action); return; }

    // 退出家庭
    if (e.target.matches('#fd-leave')) { leaveFamily(); return; }
  });

  // 表单输入
  page.addEventListener('input', (e) => {
    if (e.target.classList.contains('input') && e.target.dataset.field) {
      state.form[e.target.dataset.field] = e.target.value;
    }
  });

  // 图片上传
  page.addEventListener('change', (e) => {
    if (e.target.type === 'file' && e.target.files[0]) {
      processImage(e.target.files[0]);
    }
  });
}

function init(params) {
  state = { ...state, ...params, adding: false, form: { name: '', emoji: '', category: 'meat', desc: '', image: '' }, currentTab: 'dishes' };
  document.title = params.familyName || '家庭详情';
  loadAll();
  filterHotDishes();
  render();
  setupEvents();
}

export { init as initFamilyDetailPage };

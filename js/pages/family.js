// 家庭列表页面 — 替代 pages/family/family.js + family.wxml

import { showToast, showLoading, hideLoading } from '../utils.js';
import { createFamily, joinFamily, getUserFamilies } from '../services/family.js';
import { navigateTo } from '../app.js';

let state = {
  families: [],
  showCreate: false,
  showJoin: false,
  createName: '',
  joinCode: ''
};

function loadFamilies() {
  try {
    state.families = getUserFamilies();
  } catch (e) {
    state.families = [];
  }
}

function render() {
  const el = document.getElementById('page-family');
  if (!el) return;

  if (state.families.length === 0 && !state.showJoin) {
    el.innerHTML = `
      <div class="empty-state">
        <div class="empty-badge">👨‍👩‍👧</div>
        <span class="empty-title">还没有家庭</span>
        <span class="empty-desc">创建一个家庭，和家人共享菜单</span>
        <div class="empty-actions">
          <button class="btn btn-primary" id="family-create-btn">🏠 创建家庭</button>
          <button class="btn btn-outline" id="family-join-btn">🔑 输入邀请码</button>
        </div>
      </div>
      <div id="family-create-form"></div>
    `;
    if (state.showCreate) renderCreateForm();
    return;
  }

  // 有家庭列表
  let html = `
    <div class="family-list">
      <div class="list-header"><span class="list-title">我的家庭</span><span class="list-count">${state.families.length} 个</span></div>
  `;

  state.families.forEach(f => {
    const roleLabel = f.role === 'owner' ? '创建者' : f.role === 'admin' ? '管理员' : '成员';
    html += `
      <div class="family-card" data-family-id="${f._id}" data-family-name="${f.name}">
        <div class="card-left">
          <span class="card-icon">🏠</span>
          <div class="card-info">
            <span class="card-name">${f.name}</span>
            <span class="card-meta">${f.memberCount || 0} 位成员 · ${roleLabel}</span>
          </div>
        </div>
        <div class="card-right">
          <div class="card-tags">
            <span class="tag tag-dish">${f.dishCount || 0} 道菜</span>
            ${f.role === 'owner' || f.role === 'admin' ? `<span class="tag tag-code">邀请码 ${f.inviteCode}</span>` : ''}
          </div>
          <span class="card-arrow">›</span>
        </div>
      </div>`;
  });

  html += `
      <div class="bottom-actions">
        <button class="btn btn-outline-sm" id="family-create-btn2">+ 创建家庭</button>
        <button class="btn btn-outline-sm" id="family-join-btn2">🔑 加入家庭</button>
      </div>
    </div>
    <div id="family-join-form"></div>
  `;

  el.innerHTML = html;
  if (state.showJoin) renderJoinForm();
  if (state.showCreate) renderCreateForm();
}

function renderCreateForm() {
  const targetEl = document.getElementById('family-create-form') || document.getElementById('page-family');
  if (!targetEl) return;

  const formHtml = `
    <div class="form-card" id="create-form-card">
      <div class="form-header">
        <span class="form-title">创建家庭</span>
        <span class="form-close" id="create-close">✕</span>
      </div>
      <input class="input" placeholder="家庭名称（如"我们家"）" value="${state.createName}" id="create-name-input" maxlength="20" />
      <button class="btn btn-primary" id="create-confirm" style="margin-top:16px;">确认创建</button>
    </div>
  `;

  if (targetEl.id === 'page-family') {
    targetEl.insertAdjacentHTML('beforeend', formHtml);
  } else {
    targetEl.innerHTML = formHtml;
  }
  state.showCreate = true;
}

function renderJoinForm() {
  const targetEl = document.getElementById('family-join-form') || document.getElementById('page-family');
  if (!targetEl) return;

  const formHtml = `
    <div class="form-card" id="join-form-card">
      <div class="form-header">
        <span class="form-title">加入家庭</span>
        <span class="form-close" id="join-close">✕</span>
      </div>
      <input class="input" placeholder="输入 6 位邀请码" value="${state.joinCode}" id="join-code-input" maxlength="6" style="text-transform:uppercase;" />
      ${state.joinCode.length === 6
        ? '<button class="btn btn-primary" id="join-confirm" style="margin-top:16px;">确认加入</button>'
        : '<button class="btn btn-disabled" style="margin-top:16px;" disabled>请输入 6 位邀请码</button>'}
    </div>
  `;

  if (targetEl.id === 'page-family') {
    targetEl.insertAdjacentHTML('beforeend', formHtml);
  } else {
    targetEl.innerHTML = formHtml;
  }
  state.showJoin = true;
}

// ---- 事件 ----
function setupEvents() {
  const page = document.getElementById('page-family');
  if (!page) return;

  page.addEventListener('click', async (e) => {
    // 打开家庭详情
    const card = e.target.closest('.family-card');
    if (card) {
      const id = card.dataset.familyId;
      const name = card.dataset.familyName;
      navigateTo('family-detail', { familyId: id, familyName: name });
      return;
    }

    // 创建按钮
    if (e.target.matches('#family-create-btn, #family-create-btn2')) {
      state.showCreate = true;
      state.showJoin = false;
      state.createName = '';
      render();
      return;
    }

    // 加入按钮
    if (e.target.matches('#family-join-btn, #family-join-btn2')) {
      state.showJoin = true;
      state.showCreate = false;
      state.joinCode = '';
      render();
      return;
    }

    // 关闭创建表单
    if (e.target.matches('#create-close')) {
      state.showCreate = false;
      render();
      return;
    }

    // 关闭加入表单
    if (e.target.matches('#join-close')) {
      state.showJoin = false;
      render();
      return;
    }

    // 确认创建
    if (e.target.matches('#create-confirm')) {
      const name = state.createName.trim();
      if (!name) { showToast('请输入家庭名称', 'none'); return; }
      const res = createFamily(name);
      if (res.success) {
        showToast('创建成功', 'success');
        state.showCreate = false;
        state.createName = '';
        loadFamilies();
        render();
      } else {
        showToast(res.error, 'none');
      }
      return;
    }

    // 确认加入
    if (e.target.matches('#join-confirm')) {
      const code = state.joinCode.trim();
      if (code.length !== 6) return;
      const res = joinFamily(code);
      if (res.success) {
        showToast('加入成功', 'success');
        state.showJoin = false;
        state.joinCode = '';
        loadFamilies();
        render();
      } else {
        showToast(res.error, 'none');
      }
      return;
    }
  });

  // 输入事件
  page.addEventListener('input', (e) => {
    if (e.target.id === 'create-name-input') {
      state.createName = e.target.value;
    }
    if (e.target.id === 'join-code-input') {
      state.joinCode = e.target.value.toUpperCase();
      if (state.joinCode.length === 6) renderJoinForm();
    }
  });
}

function init() {
  loadFamilies();
  render();
  setupEvents();
}

export { init as initFamilyPage, loadFamilies as refreshFamilyList };

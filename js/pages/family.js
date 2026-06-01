// 家庭列表页面

var famState = {
  families: [],
  showCreate: false,
  showJoin: false,
  createName: '',
  joinCode: ''
};

function famLoadFamilies() {
  try { famState.families = getUserFamilies(); }
  catch (e) { famState.families = []; }
}

function famRender() {
  var el = document.getElementById('page-family');
  if (!el) return;

  if (famState.families.length === 0 && !famState.showJoin) {
    el.innerHTML = '<div class="empty-state"><div class="empty-badge">👨‍👩‍👧</div><span class="empty-title">还没有家庭</span><span class="empty-desc">创建一个家庭，和家人共享菜单</span><div class="empty-actions"><button class="btn btn-primary" id="family-create-btn">🏠 创建家庭</button><button class="btn btn-outline" id="family-join-btn">🔑 输入邀请码</button></div></div><div id="family-create-form"></div>';
    if (famState.showCreate) famRenderCreateForm();
    return;
  }

  var html = '<div class="family-list"><div class="list-header"><span class="list-title">我的家庭</span><span class="list-count">' + famState.families.length + ' 个</span></div>';
  famState.families.forEach(function(f) {
    var roleLabel = f.role === 'owner' ? '创建者' : f.role === 'admin' ? '管理员' : '成员';
    html += '<div class="family-card" data-family-id="' + f._id + '" data-family-name="' + f.name + '"><div class="card-left"><span class="card-icon">🏠</span><div class="card-info"><span class="card-name">' + f.name + '</span><span class="card-meta">' + (f.memberCount || 0) + ' 位成员 · ' + roleLabel + '</span></div></div><div class="card-right"><div class="card-tags"><span class="tag tag-dish">' + (f.dishCount || 0) + ' 道菜</span>' + (f.role === 'owner' || f.role === 'admin' ? '<span class="tag tag-code">邀请码 ' + f.inviteCode + '</span>' : '') + '</div><span class="card-arrow">›</span></div></div>';
  });
  html += '<div class="bottom-actions"><button class="btn btn-outline-sm" id="family-create-btn2">+ 创建家庭</button><button class="btn btn-outline-sm" id="family-join-btn2">🔑 加入家庭</button></div></div><div id="family-join-form"></div>';
  el.innerHTML = html;
  if (famState.showJoin) famRenderJoinForm();
  if (famState.showCreate) famRenderCreateForm();
}

function famRenderCreateForm() {
  var targetEl = document.getElementById('family-create-form') || document.getElementById('page-family');
  if (!targetEl) return;
  var formHtml = '<div class="form-card" id="create-form-card"><div class="form-header"><span class="form-title">创建家庭</span><span class="form-close" id="create-close">✕</span></div><input class="input" placeholder="家庭名称（如我们家）" value="' + famState.createName + '" id="create-name-input" maxlength="20" /><button class="btn btn-primary" id="create-confirm" style="margin-top:16px;">确认创建</button></div>';
  if (targetEl.id === 'page-family') { targetEl.insertAdjacentHTML('beforeend', formHtml); }
  else { targetEl.innerHTML = formHtml; }
  famState.showCreate = true;
}

function famRenderJoinForm() {
  var targetEl = document.getElementById('family-join-form') || document.getElementById('page-family');
  if (!targetEl) return;
  var formHtml = '<div class="form-card" id="join-form-card"><div class="form-header"><span class="form-title">加入家庭</span><span class="form-close" id="join-close">✕</span></div><input class="input" placeholder="输入 6 位邀请码" value="' + famState.joinCode + '" id="join-code-input" maxlength="6" style="text-transform:uppercase;" />' + (famState.joinCode.length === 6 ? '<button class="btn btn-primary" id="join-confirm" style="margin-top:16px;">确认加入</button>' : '<button class="btn btn-disabled" style="margin-top:16px;" disabled>请输入 6 位邀请码</button>') + '</div>';
  if (targetEl.id === 'page-family') { targetEl.insertAdjacentHTML('beforeend', formHtml); }
  else { targetEl.innerHTML = formHtml; }
  famState.showJoin = true;
}

function famSetupEvents() {
  var page = document.getElementById('page-family');
  if (!page) return;

  page.addEventListener('click', function(e) {
    var card = e.target.closest('.family-card');
    if (card) { navigateTo('family-detail', { familyId: card.dataset.familyId, familyName: card.dataset.familyName }); return; }
    if (e.target.matches('#family-create-btn, #family-create-btn2')) { famState.showCreate = true; famState.showJoin = false; famState.createName = ''; famRender(); return; }
    if (e.target.matches('#family-join-btn, #family-join-btn2')) { famState.showJoin = true; famState.showCreate = false; famState.joinCode = ''; famRender(); return; }
    if (e.target.matches('#create-close')) { famState.showCreate = false; famRender(); return; }
    if (e.target.matches('#join-close')) { famState.showJoin = false; famRender(); return; }
    if (e.target.matches('#create-confirm')) {
      var name = famState.createName.trim();
      if (!name) { showToast('请输入家庭名称', 'none'); return; }
      var res = createFamily(name);
      if (res.success) { showToast('创建成功', 'success'); famState.showCreate = false; famState.createName = ''; famLoadFamilies(); famRender(); }
      else { showToast(res.error, 'none'); }
      return;
    }
    if (e.target.matches('#join-confirm')) {
      var code = famState.joinCode.trim();
      if (code.length !== 6) return;
      var res = joinFamily(code);
      if (res.success) { showToast('加入成功', 'success'); famState.showJoin = false; famState.joinCode = ''; famLoadFamilies(); famRender(); }
      else { showToast(res.error, 'none'); }
      return;
    }
  });

  page.addEventListener('input', function(e) {
    if (e.target.id === 'create-name-input') famState.createName = e.target.value;
    if (e.target.id === 'join-code-input') { famState.joinCode = e.target.value.toUpperCase(); if (famState.joinCode.length === 6) famRenderJoinForm(); }
  });
}

function initFamilyPage() {
  famLoadFamilies();
  famRender();
  famSetupEvents();
}

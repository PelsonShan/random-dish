// 家庭详情页面

var FD_CATEGORY_LABELS = { meat: '荤菜', veggie: '素菜', noodle: '主食', soup: '汤品' };
var FD_CATEGORY_ORDER = ['meat', 'veggie', 'noodle', 'soup'];

var fdState = {
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

function fdLoadAll() {
  var detail = getFamilyDetail(fdState.familyId);
  if (!detail) { showToast('家庭不存在', 'none'); navigateBack(); return; }
  fdState.inviteCode = detail.inviteCode;
  fdState.myRole = detail.myRole;
  fdState.myOpenId = detail.myOpenId;
  fdState.allDishes = detail.allDishes;
  fdState.groupedDishes = fdGroupByCategory(fdState.allDishes);
  fdState.members = detail.members;
  fdState.familyName = detail.family.name;
}

function fdGroupByCategory(dishes) {
  return FD_CATEGORY_ORDER.map(function(cat) {
    return { label: FD_CATEGORY_LABELS[cat], key: cat, items: dishes.filter(function(d) { return d.category === cat; }) };
  }).filter(function(g) { return g.items.length; });
}

function fdFilterHotDishes() {
  fdState.hotDishes = fdState.hotFilter === 'all' ? HOT_DISHES : HOT_DISHES.filter(function(d) { return d.category === fdState.hotFilter; });
}

function fdAddDish() {
  if (!fdState.form.name.trim()) { showToast('请输入菜名', 'none'); return; }
  addFamilyDish(fdState.familyId, {
    name: fdState.form.name.trim(), emoji: fdState.form.emoji || '🍽️',
    desc: fdState.form.desc || '暂无描述', category: fdState.form.category, image: fdState.form.image || ''
  });
  fdState.form = { name: '', emoji: '', category: 'meat', desc: '', image: '' };
  fdState.adding = false;
  fdLoadAll();
  fdRender();
  showToast('添加成功', 'success');
}

function fdAddPopular(index) {
  var dish = fdState.hotDishes[index];
  if (fdState.allDishes.some(function(d) { return d.name === dish.name; })) {
    showToast(dish.name + ' 已存在', 'none'); return;
  }
  addFamilyDish(fdState.familyId, { name: dish.name, emoji: dish.emoji, desc: dish.desc, category: dish.category, image: '' });
  fdLoadAll();
  fdRender();
  showToast('已添加 ' + dish.name, 'success');
  vibrate(20);
}

function fdDeleteDish(id) {
  showModal('确认删除', '确定要删除这道菜吗？').then(function(confirmed) {
    if (!confirmed) return;
    deleteFamilyDish(id);
    fdLoadAll();
    fdRender();
  });
}

function fdHandleManageMember(userId, action) {
  var res = manageMember(fdState.familyId, userId, action);
  if (res.success) { showToast('操作成功', 'success'); fdLoadAll(); fdRender(); }
  else { showToast(res.error, 'none'); }
}

function fdLeaveFamily() {
  showModal('退出家庭', '确定要退出这个家庭吗？').then(function(confirmed) {
    if (!confirmed) return;
    var res = manageMember(fdState.familyId, fdState.myOpenId, 'leave');
    if (res.success) { showToast('已退出', 'success'); setTimeout(function() { navigateBack(); }, 1500); }
    else { showToast(res.error, 'none'); }
  });
}

function fdCopyInviteCode() {
  navigator.clipboard.writeText(fdState.inviteCode).then(
    function() { showToast('已复制', 'success'); },
    function() { showToast('复制失败', 'none'); }
  );
}

function fdProcessImage(file) {
  var reader = new FileReader();
  reader.onload = function(e) {
    var img = new Image();
    img.onload = function() {
      var canvas = document.createElement('canvas');
      var maxW = 200, scale = maxW / img.width;
      canvas.width = maxW; canvas.height = img.height * scale;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      fdState.form.image = canvas.toDataURL('image/jpeg', 0.6);
      fdRenderForm();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function fdRender() {
  var el = document.getElementById('page-family-detail');
  if (!el) return;
  var isAdmin = fdState.myRole === 'owner' || fdState.myRole === 'admin';

  el.innerHTML = (isAdmin ? '<div class="invite-bar"><div class="invite-code"><span class="invite-label">邀请码</span><span class="invite-value">' + fdState.inviteCode + '</span></div><div class="invite-actions"><button class="invite-btn" id="fd-copy-invite">📋 复制</button><button class="invite-btn invite-share" id="fd-share">📤 分享</button></div></div>' : '') +
    '<div class="tab-bar"><button class="tab ' + (fdState.currentTab === 'dishes' ? 'active' : '') + '" data-tab="dishes">🍽️ 家庭菜单</button><button class="tab ' + (fdState.currentTab === 'members' ? 'active' : '') + '" data-tab="members">👥 成员 (' + fdState.members.length + ')</button></div>' +
    '<div id="fd-tab-content"></div><div id="fd-form-area"></div><button class="btn-leave" id="fd-leave">退出家庭</button>';

  if (fdState.currentTab === 'dishes') fdRenderDishesTab();
  else fdRenderMembersTab();
}

function fdRenderDishesTab() {
  var el = document.getElementById('fd-tab-content');
  if (!el) return;
  var isAdmin = fdState.myRole === 'owner' || fdState.myRole === 'admin';

  el.innerHTML = '<div class="popular-section"><span class="section-label">🔥 热门菜品 · 一键添加</span><div class="hot-filter-row" id="fd-hot-filter">' +
    ['all','meat','veggie','noodle','soup'].map(function(c) {
      var labels = {all:'全部',meat:'荤菜',veggie:'素菜',noodle:'主食',soup:'汤品'};
      return '<button class="hot-filter-btn ' + (fdState.hotFilter === c ? 'active' : '') + '" data-filter="' + c + '">' + labels[c] + '</button>';
    }).join('') + '</div><div class="popular-scroll-row" id="fd-hot-list">' +
    fdState.hotDishes.map(function(d, i) {
      return '<div class="popular-item" data-hot-idx="' + i + '"><span class="pop-emoji">' + d.emoji + '</span><span class="pop-name">' + d.name + '</span><span class="pop-add">+</span></div>';
    }).join('') + '</div></div>' +
    (isAdmin ? '<div class="add-bar"><button class="btn-add" id="fd-toggle-add">' + (fdState.adding ? '收起' : '+ 自定义菜品') + '</button></div>' : '') +
    '<div id="fd-dish-list">' + fdState.groupedDishes.map(function(g) {
      return '<div class="section"><div class="section-header"><span class="section-title">' + g.label + '</span><span class="section-count">' + g.items.length + '道</span></div><div class="dish-list">' +
        g.items.map(function(d) {
          return '<div class="dish-item">' + (d.image ? '<img class="item-img" src="' + d.image + '" />' : '<span class="item-emoji">' + d.emoji + '</span>') +
            '<div class="item-body"><span class="item-name">' + d.name + '</span><span class="item-desc">' + d.desc + '</span></div>' +
            (isAdmin ? '<button class="btn-del" data-del-id="' + d._id + '"><span class="del-icon">✕</span></button>' : '') + '</div>';
        }).join('') + '</div></div>';
    }).join('') + '</div>';

  if (fdState.adding) fdRenderForm();
}

function fdRenderMembersTab() {
  var el = document.getElementById('fd-tab-content');
  if (!el) return;
  var isOwner = fdState.myRole === 'owner';
  el.innerHTML = '<div class="member-list">' + fdState.members.map(function(m) {
    return '<div class="member-item"><span class="member-avatar">👤</span><div class="member-info"><span class="member-name">' + (m.nickname || '匿名用户') + '</span><span class="member-role role-' + m.role + '">' + (m.role === 'owner' ? '创建者' : m.role === 'admin' ? '管理员' : '成员') + '</span></div>' +
      (isOwner && m.role !== 'owner' ? '<div class="member-actions">' + (m.role === 'admin' ? '<button class="member-act-btn" data-action="revokeAdmin" data-uid="' + m.userId + '">取消管理</button>' : '<button class="member-act-btn" data-action="setAdmin" data-uid="' + m.userId + '">设为管理</button>') + '<button class="member-act-btn danger" data-action="remove" data-uid="' + m.userId + '">移除</button></div>' : '') +
      '</div>';
  }).join('') + '</div>';
}

function fdRenderForm() {
  var el = document.getElementById('fd-form-area');
  if (!el) return;
  var f = fdState.form;
  el.innerHTML = '<div class="add-form"><div class="img-section"><div class="img-picker">' +
    (f.image ? '<img class="preview-img" src="' + f.image + '" />' : '<div class="img-placeholder"><span class="img-icon">📷</span><span class="img-hint">上传菜品图片</span></div>') +
    '</div><div class="img-actions"><label class="img-btn"><span class="img-btn-icon">📸</span><span class="img-btn-text">拍照</span><input type="file" accept="image/*" capture="camera" class="file-input" /></label><label class="img-btn"><span class="img-btn-icon">🖼️</span><span class="img-btn-text">相册</span><input type="file" accept="image/*" class="file-input" /></label></div></div>' +
    '<input class="input" placeholder="菜名（必填）" value="' + (f.name||'') + '" data-field="name" />' +
    '<input class="input" placeholder="Emoji（如 🍗，可选）" value="' + (f.emoji||'') + '" data-field="emoji" maxlength="2" />' +
    '<input class="input" placeholder="一句话描述（可选）" value="' + (f.desc||'') + '" data-field="desc" />' +
    '<div class="cat-row"><span class="cat-label">分类</span>' +
    ['meat','veggie','noodle','soup'].map(function(c) {
      return '<button class="cat-btn ' + (f.category === c ? 'active' : '') + '" data-cat="' + c + '">' + FD_CATEGORY_LABELS[c] + '</button>';
    }).join('') + '</div>' +
    '<button class="btn-confirm" id="fd-form-confirm">确认添加</button></div>';
}

function fdSetupEvents() {
  var page = document.getElementById('page-family-detail');
  if (!page) return;
  page.addEventListener('click', function(e) {
    var tab = e.target.closest('.tab');
    if (tab) { fdState.currentTab = tab.dataset.tab; fdRender(); return; }
    var filterBtn = e.target.closest('#fd-hot-filter .hot-filter-btn');
    if (filterBtn) { fdState.hotFilter = filterBtn.dataset.filter; fdFilterHotDishes(); fdRenderDishesTab(); return; }
    var hotItem = e.target.closest('#fd-hot-list .popular-item');
    if (hotItem) { fdAddPopular(parseInt(hotItem.dataset.hotIdx)); return; }
    if (e.target.matches('#fd-toggle-add')) { fdState.adding = !fdState.adding; fdRender(); return; }
    if (e.target.matches('#fd-form-confirm')) { fdAddDish(); return; }
    var catBtn = e.target.closest('.cat-btn');
    if (catBtn) { fdState.form.category = catBtn.dataset.cat; fdRenderForm(); return; }
    var delBtn = e.target.closest('.btn-del');
    if (delBtn) { fdDeleteDish(delBtn.dataset.delId); return; }
    if (e.target.matches('#fd-copy-invite')) { fdCopyInviteCode(); return; }
    if (e.target.matches('#fd-share')) { showToast('邀请码: ' + fdState.inviteCode, 'none'); return; }
    var actBtn = e.target.closest('.member-act-btn');
    if (actBtn) { fdHandleManageMember(actBtn.dataset.uid, actBtn.dataset.action); return; }
    if (e.target.matches('#fd-leave')) { fdLeaveFamily(); return; }
  });
  page.addEventListener('input', function(e) {
    if (e.target.classList.contains('input') && e.target.dataset.field) {
      fdState.form[e.target.dataset.field] = e.target.value;
    }
  });
  page.addEventListener('change', function(e) {
    if (e.target.type === 'file' && e.target.files[0]) fdProcessImage(e.target.files[0]);
  });
}

function initFamilyDetailPage(params) {
  fdState.familyId = params.familyId || '';
  fdState.familyName = params.familyName || '';
  fdState.adding = false;
  fdState.form = { name: '', emoji: '', category: 'meat', desc: '', image: '' };
  fdState.currentTab = 'dishes';
  document.title = params.familyName || '家庭详情';
  fdLoadAll();
  fdFilterHotDishes();
  fdRender();
  fdSetupEvents();
}

// 菜品管理页面

var MGR_CATEGORY_LABELS = { meat: '荤菜', veggie: '素菜', noodle: '主食', soup: '汤品' };
var MGR_CATEGORY_ORDER = ['meat', 'veggie', 'noodle', 'soup'];

var mgrState = {
  dishes: [],
  grouped: [],
  hotDishes: HOT_DISHES,
  hotFilter: 'all',
  adding: false,
  form: { name: '', emoji: '', category: 'meat', desc: '', image: '' },
  _idCounter: 0
};

function mgrLoadDishes() {
  mgrState.dishes = getMyDishes();
  mgrState._idCounter = mgrState.dishes.reduce(function(max, d) { return Math.max(max, d.id || 0); }, 0);
  mgrState.grouped = mgrGroupByCategory(mgrState.dishes);
}

function mgrGroupByCategory(dishes) {
  return MGR_CATEGORY_ORDER.map(function(cat) {
    return {
      label: MGR_CATEGORY_LABELS[cat],
      key: cat,
      items: dishes.filter(function(d) { return d.category === cat; })
    };
  }).filter(function(g) { return g.items.length; });
}

function mgrFilterHotDishes() {
  mgrState.hotDishes = mgrState.hotFilter === 'all'
    ? HOT_DISHES
    : HOT_DISHES.filter(function(d) { return d.category === mgrState.hotFilter; });
}

function mgrAddDish() {
  if (!mgrState.form.name.trim()) { showToast('请输入菜名', 'none'); return; }
  var newDish = {
    id: mgrState._idCounter + 1,
    name: mgrState.form.name.trim(),
    emoji: mgrState.form.emoji || '🍽️',
    desc: mgrState.form.desc || '暂无描述',
    category: mgrState.form.category,
    image: mgrState.form.image || ''
  };
  mgrState.dishes = mgrState.dishes.concat([newDish]);
  saveMyDishes(mgrState.dishes);
  mgrState._idCounter++;
  mgrState.grouped = mgrGroupByCategory(mgrState.dishes);
  mgrState.form = { name: '', emoji: '', category: 'meat', desc: '', image: '' };
  mgrState.adding = false;
  showToast('添加成功', 'success');
  mgrRender();
}

function mgrAddPopular(index) {
  var dish = mgrState.hotDishes[index];
  if (mgrState.dishes.some(function(d) { return d.name === dish.name; })) {
    showToast(dish.name + ' 已存在', 'none'); return;
  }
  var newDish = { id: mgrState._idCounter + 1, name: dish.name, emoji: dish.emoji, desc: dish.desc, category: dish.category, image: '' };
  mgrState.dishes = mgrState.dishes.concat([newDish]);
  saveMyDishes(mgrState.dishes);
  mgrState._idCounter++;
  mgrState.grouped = mgrGroupByCategory(mgrState.dishes);
  showToast('已添加 ' + dish.name, 'success');
  vibrate(20);
  mgrRender();
}

function mgrDeleteDish(id) {
  showModal('确认删除', '确定要删除这道菜吗？').then(function(confirmed) {
    if (!confirmed) return;
    mgrState.dishes = mgrState.dishes.filter(function(d) { return d.id !== id; });
    saveMyDishes(mgrState.dishes);
    mgrState.grouped = mgrGroupByCategory(mgrState.dishes);
    mgrRender();
  });
}

function mgrProcessImage(file) {
  var reader = new FileReader();
  reader.onload = function(e) {
    var img = new Image();
    img.onload = function() {
      var canvas = document.createElement('canvas');
      var maxW = 200;
      var scale = maxW / img.width;
      canvas.width = maxW;
      canvas.height = img.height * scale;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      mgrState.form.image = canvas.toDataURL('image/jpeg', 0.6);
      mgrRenderForm();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function mgrRender() {
  mgrRenderHotFilter();
  mgrRenderHotList();
  mgrRenderForm();
  mgrRenderDishList();
  mgrRenderAddBtn();
}

function mgrRenderHotFilter() {
  var el = document.getElementById('manage-hot-filter');
  if (!el) return;
  var cats = ['all', 'meat', 'veggie', 'noodle', 'soup'];
  var labels = { all: '全部', meat: '荤菜', veggie: '素菜', noodle: '主食', soup: '汤品' };
  el.innerHTML = cats.map(function(c) {
    return '<button class="hot-filter-btn ' + (mgrState.hotFilter === c ? 'active' : '') + '" data-filter="' + c + '">' + labels[c] + '</button>';
  }).join('');
}

function mgrRenderHotList() {
  var el = document.getElementById('manage-hot-list');
  if (!el) return;
  el.innerHTML = mgrState.hotDishes.map(function(d, i) {
    return '<div class="popular-item" data-index="' + i + '"><span class="pop-emoji">' + d.emoji + '</span><span class="pop-name">' + d.name + '</span><span class="pop-add">+</span></div>';
  }).join('');
}

function mgrRenderAddBtn() {
  var el = document.getElementById('manage-add-btn');
  if (!el) return;
  el.innerHTML = mgrState.adding ? '收起' : '+ 自定义菜品';
}

function mgrEscapeHtml(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function mgrRenderForm() {
  var el = document.getElementById('manage-form');
  if (!el) return;
  if (!mgrState.adding) { el.innerHTML = ''; return; }
  var f = mgrState.form;
  el.innerHTML = '<div class="img-section"><div class="img-picker">' +
    (f.image ? '<img class="preview-img" src="' + f.image + '" />' : '<div class="img-placeholder"><span class="img-icon">📷</span><span class="img-hint">上传菜品图片</span></div>') +
    '</div><div class="img-actions">' +
    '<label class="img-btn"><span class="img-btn-icon">📸</span><span class="img-btn-text">拍照</span><input type="file" accept="image/*" capture="camera" class="file-input" /></label>' +
    '<label class="img-btn"><span class="img-btn-icon">🖼️</span><span class="img-btn-text">相册</span><input type="file" accept="image/*" class="file-input" /></label>' +
    '</div></div>' +
    '<input class="input" placeholder="菜名（必填）" value="' + mgrEscapeHtml(f.name) + '" data-field="name" />' +
    '<input class="input" placeholder="Emoji（如 🍗，可选）" value="' + mgrEscapeHtml(f.emoji) + '" data-field="emoji" maxlength="2" />' +
    '<input class="input" placeholder="一句话描述（可选）" value="' + mgrEscapeHtml(f.desc) + '" data-field="desc" />' +
    '<div class="cat-row"><span class="cat-label">分类</span>' +
    ['meat','veggie','noodle','soup'].map(function(c) {
      return '<button class="cat-btn ' + (f.category === c ? 'active' : '') + '" data-cat="' + c + '">' + MGR_CATEGORY_LABELS[c] + '</button>';
    }).join('') + '</div>' +
    '<button class="btn-confirm" id="manage-form-confirm">确认添加</button>';
}

function mgrRenderDishList() {
  var el = document.getElementById('manage-dish-list');
  if (!el) return;
  if (!mgrState.grouped.length) {
    el.innerHTML = '<div class="empty"><span class="empty-icon">🍽️</span><span class="empty-text">还没有菜品</span><span class="empty-hint">从热门菜品快速添加，或自定义创建</span></div>';
    return;
  }
  el.innerHTML = mgrState.grouped.map(function(g) {
    return '<div class="section"><div class="section-header"><span class="section-title">' + g.label + '</span><span class="section-count">' + g.items.length + '道</span></div><div class="dish-list">' +
      g.items.map(function(d) {
        return '<div class="dish-item">' +
          (d.image ? '<img class="item-img" src="' + d.image + '" />' : '<span class="item-emoji">' + d.emoji + '</span>') +
          '<div class="item-body"><span class="item-name">' + d.name + '</span><span class="item-desc">' + d.desc + '</span></div>' +
          '<button class="btn-del" data-del-id="' + d.id + '"><span class="del-icon">✕</span></button></div>';
      }).join('') + '</div></div>';
  }).join('');
}

function mgrSetupEvents() {
  document.getElementById('manage-hot-filter').addEventListener('click', function(e) {
    var btn = e.target.closest('.hot-filter-btn');
    if (btn) { mgrState.hotFilter = btn.dataset.filter; mgrFilterHotDishes(); mgrRender(); }
  });
  document.getElementById('manage-hot-list').addEventListener('click', function(e) {
    var item = e.target.closest('.popular-item');
    if (item) mgrAddPopular(parseInt(item.dataset.index));
  });
  document.getElementById('manage-add-btn').addEventListener('click', function() {
    mgrState.adding = !mgrState.adding;
    if (!mgrState.adding) mgrState.form = { name: '', emoji: '', category: 'meat', desc: '', image: '' };
    mgrRender();
  });
  document.getElementById('manage-form').addEventListener('click', function(e) {
    if (e.target.matches('#manage-form-confirm')) { mgrAddDish(); return; }
    var catBtn = e.target.closest('.cat-btn');
    if (catBtn) { mgrState.form.category = catBtn.dataset.cat; mgrRenderForm(); }
  });
  document.getElementById('manage-form').addEventListener('input', function(e) {
    if (e.target.classList.contains('input') && e.target.dataset.field) {
      mgrState.form[e.target.dataset.field] = e.target.value;
    }
  });
  document.getElementById('manage-form').addEventListener('change', function(e) {
    if (e.target.type === 'file' && e.target.files[0]) {
      mgrProcessImage(e.target.files[0]);
    }
  });
  document.getElementById('manage-dish-list').addEventListener('click', function(e) {
    var delBtn = e.target.closest('.btn-del');
    if (delBtn) mgrDeleteDish(parseInt(delBtn.dataset.delId));
  });
}

function initManagePage() {
  mgrLoadDishes();
  mgrFilterHotDishes();
  mgrRender();
  mgrSetupEvents();
}

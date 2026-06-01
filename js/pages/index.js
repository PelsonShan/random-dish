// 随机开饭页面 - 使用 index_* 前缀避免命名冲突

var indexState = {
  currentDishes: [],
  history: [],
  combo: '1c1t',
  spinning: false,
  source: 'personal',
  families: [],
  familyDishes: {},
  familyLabel: '个人菜单',
  spinningTimer: null
};

var INDEX_COMBOS = [
  { key: '1c',   label: '单菜',     dishes: 1, soups: 0 },
  { key: '2c',   label: '两菜',     dishes: 2, soups: 0 },
  { key: '1c1t', label: '一菜一汤', dishes: 1, soups: 1 },
  { key: '2c1t', label: '两菜一汤', dishes: 2, soups: 1 },
  { key: '3c1t', label: '三菜一汤', dishes: 3, soups: 1 },
];

function indexGetDishes() {
  if (indexState.source === 'personal') {
    var dishes = getMyDishes();
    if (!dishes || !dishes.length) {
      dishes = DEFAULT_DISHES;
      saveMyDishes(dishes);
    }
    return dishes;
  }
  return indexState.familyDishes[indexState.source] || [];
}

function indexSwitchSource(source) {
  if (source === 'personal') {
    indexState.source = 'personal';
    indexState.familyLabel = '个人菜单';
    indexRender();
    return;
  }
  var family = indexState.families.find(function(f) { return f._id === source; });
  indexState.source = source;
  indexState.familyLabel = family ? '🏠 ' + family.name : '';

  if (!indexState.familyDishes[source]) {
    var allDishes = getCollection('family_dishes');
    indexState.familyDishes[source] = allDishes.filter(function(d) { return d.familyId === source; });
  }
  indexRender();
}

function indexRandomDish() {
  var dishes = indexGetDishes();
  if (!dishes || !dishes.length) {
    showToast('当前菜单没有菜品', 'none');
    return;
  }
  if (indexState.spinning) return;
  indexState.spinning = true;
  indexRenderSpinningBtn(true);

  var combo = INDEX_COMBOS.find(function(c) { return c.key === indexState.combo; });
  var dishPool = dishes.filter(function(d) { return d.category !== 'soup'; });
  var soupPool = dishes.filter(function(d) { return d.category === 'soup'; });

  var availableDishCount = Math.min(combo.dishes, dishPool.length);
  var availableSoupCount = Math.min(combo.soups, soupPool.length);

  if (availableDishCount === 0 && availableSoupCount === 0) {
    indexState.spinning = false;
    indexRenderSpinningBtn(false);
    showToast('菜品数量不足', 'none');
    return;
  }

  var targetDishes = pickRandom(dishPool, availableDishCount);
  var targetSoups = availableSoupCount > 0 ? pickRandom(soupPool, availableSoupCount) : [];
  var target = targetDishes.concat(targetSoups);

  var count = 0;
  var maxCount = 12;

  function spin() {
    var animD = pickRandom(dishPool, availableDishCount);
    var animS = availableSoupCount > 0 ? pickRandom(soupPool, availableSoupCount) : [];
    indexState.currentDishes = animD.concat(animS);
    indexRenderResult();
    count++;
    if (count >= maxCount) {
      indexFinalizePick(target, combo);
    } else {
      indexState.spinningTimer = setTimeout(spin, 80 + count * 20);
    }
  }
  spin();
}

function indexFinalizePick(dishes, combo) {
  indexState.currentDishes = dishes;
  var record = {
    comboLabel: combo.label,
    sourceLabel: indexState.familyLabel,
    dishes: dishes.map(function(d) { return { name: d.name, emoji: d.emoji }; }),
    time: Date.now()
  };
  indexState.history = [record].concat(indexState.history).slice(0, 12);
  indexState.spinning = false;
  indexRender();
  vibrate(50);
}

function indexSetCombo(combo) {
  indexState.combo = combo;
  indexRenderComboBar();
}

function indexRender() {
  indexRenderComboBar();
  indexRenderSourceSelector();
  indexRenderResult();
  indexRenderHistory();
  indexRenderSpinningBtn(indexState.spinning);
}

function indexRenderComboBar() {
  var el = document.getElementById('combo-bar');
  if (!el) return;
  el.innerHTML = INDEX_COMBOS.map(function(c) {
    return '<button class="combo-seg ' + (indexState.combo === c.key ? 'active' : '') + '" data-combo="' + c.key + '">' + c.label + '</button>';
  }).join('');
}

function indexRenderSourceSelector() {
  var el = document.getElementById('source-selector');
  if (!el) return;
  var html = '<button class="source-btn ' + (indexState.source === 'personal' ? 'active' : '') + '" data-source="personal">👤 个人菜单</button>';
  indexState.families.forEach(function(f) {
    html += '<button class="source-btn ' + (indexState.source === f._id ? 'active' : '') + '" data-source="' + f._id + '">🏠 ' + f.name + '</button>';
  });
  el.innerHTML = html;
}

function indexRenderResult() {
  var el = document.getElementById('result-area');
  if (!el) return;
  var dishes = indexState.currentDishes;
  var spinning = indexState.spinning;

  if (!dishes.length) {
    el.innerHTML = '<div class="single-area"><div class="single-card placeholder"><span class="single-emoji">🍽️</span><span class="single-name">点击按钮开始</span></div></div>';
    return;
  }
  if (dishes.length === 1) {
    var d = dishes[0];
    el.innerHTML = '<div class="single-area ' + (spinning ? 'spinning' : '') + '"><div class="single-card">' +
      (d.image ? '<img class="single-img" src="' + d.image + '" />' : '<span class="single-emoji">' + d.emoji + '</span>') +
      '<span class="single-name">' + d.name + '</span></div></div>';
  } else {
    var cards = dishes.map(function(d) {
      return '<div class="multi-card">' +
        (d.image ? '<img class="multi-img" src="' + d.image + '" />' : '<span class="multi-emoji">' + d.emoji + '</span>') +
        '<span class="multi-name">' + d.name + '</span></div>';
    }).join('');
    el.innerHTML = '<div class="multi-area ' + (spinning ? 'spinning' : '') + '">' + cards + '</div>';
  }
}

function indexRenderHistory() {
  var el = document.getElementById('history-area');
  if (!el) return;
  if (!indexState.history.length) { el.innerHTML = ''; return; }
  var items = indexState.history.map(function(h) {
    return '<div class="history-item"><span class="history-combo">' + h.comboLabel + '</span>' +
      (h.sourceLabel && h.sourceLabel !== '个人菜单' ? '<span class="history-source">' + h.sourceLabel + '</span>' : '') +
      h.dishes.map(function(d) { return '<span class="history-name">' + d.emoji + d.name + '</span>'; }).join('') +
      '</div>';
  }).join('');
  el.innerHTML = '<span class="history-title">最近抽取</span><div class="history-list">' + items + '</div>';
}

function indexRenderSpinningBtn(spinning) {
  var el = document.getElementById('btn-random');
  if (!el) return;
  el.disabled = spinning;
  el.classList.toggle('pressing', spinning);
  el.innerHTML = spinning ? '挑选中...' : '🎲 随机开饭';
}

function indexLoadFamilies() {
  try {
    indexState.families = getUserFamilies();
  } catch (e) {
    indexState.families = [];
  }
}

function indexSetupEvents() {
  document.getElementById('combo-bar').addEventListener('click', function(e) {
    var btn = e.target.closest('.combo-seg');
    if (btn) indexSetCombo(btn.dataset.combo);
  });
  document.getElementById('btn-random').addEventListener('click', indexRandomDish);
  document.getElementById('source-selector').addEventListener('click', function(e) {
    var btn = e.target.closest('.source-btn');
    if (btn) indexSwitchSource(btn.dataset.source);
  });
}

function initIndexPage() {
  indexLoadFamilies();
  indexRender();
  indexSetupEvents();
}

function refreshIndexFamilies() {
  indexLoadFamilies();
}

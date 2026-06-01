// 今天吃啥呀？页面

// In combined mode, all deps are global — no imports needed

const CATEGORY_LABELS_I = { meat: '荤菜', veggie: '素菜', noodle: '主食', soup: '汤品' };
const COMBOS = [
  { key: '1c',   label: '单菜',     dishes: 1, soups: 0 },
  { key: '2c',   label: '两菜',     dishes: 2, soups: 0 },
  { key: '1c1t', label: '一菜一汤', dishes: 1, soups: 1 },
  { key: '2c1t', label: '两菜一汤', dishes: 2, soups: 1 },
  { key: '3c1t', label: '三菜一汤', dishes: 3, soups: 1 },
];

let state = {
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

function getDishes() {
  if (state.source === 'personal') {
    let dishes = getMyDishes();
    if (!dishes || !dishes.length) {
      dishes = DEFAULT_DISHES;
      saveMyDishes(dishes);
    }
    return dishes;
  }
  return state.familyDishes[state.source] || [];
}

async function switchSource(source) {
  if (source === 'personal') {
    state.source = 'personal';
    state.familyLabel = '个人菜单';
    render();
    return;
  }
  const family = state.families.find(f => f._id === source);
  state.source = source;
  state.familyLabel = family ? '🏠 ' + family.name : '';

  if (!state.familyDishes[source]) {
    const dishes = getCollection('family_dishes');
    state.familyDishes[source] = dishes.filter(d => d.familyId === source);
  }
  render();
}

function randomDish() {
  const dishes = getDishes();
  if (!dishes || !dishes.length) {
    showToast('当前菜单没有菜品', 'none');
    return;
  }

  if (state.spinning) return;
  state.spinning = true;
  renderSpinningBtn(true);

  const combo = COMBOS.find(c => c.key === state.combo);
  const dishPool = dishes.filter(d => d.category !== 'soup');
  const soupPool = dishes.filter(d => d.category === 'soup');

  const availableDishCount = Math.min(combo.dishes, dishPool.length);
  const availableSoupCount = Math.min(combo.soups, soupPool.length);

  if (availableDishCount === 0 && availableSoupCount === 0) {
    state.spinning = false;
    renderSpinningBtn(false);
    showToast('菜品数量不足', 'none');
    return;
  }

  const targetDishes = pickRandom(dishPool, availableDishCount);
  const targetSoups = availableSoupCount > 0 ? pickRandom(soupPool, availableSoupCount) : [];
  const target = [...targetDishes, ...targetSoups];

  let count = 0;
  const maxCount = 12;

  function spin() {
    const animD = pickRandom(dishPool, availableDishCount);
    const animS = availableSoupCount > 0 ? pickRandom(soupPool, availableSoupCount) : [];
    state.currentDishes = [...animD, ...animS];
    renderResult();

    count++;
    if (count >= maxCount) {
      finalizePick(target, combo);
    } else {
      state.spinningTimer = setTimeout(spin, 80 + count * 20);
    }
  }
  spin();
}

function finalizePick(dishes, combo) {
  state.currentDishes = dishes;
  const record = {
    comboLabel: combo.label,
    sourceLabel: state.familyLabel,
    dishes: dishes.map(d => ({ name: d.name, emoji: d.emoji })),
    time: Date.now()
  };
  state.history = [record, ...state.history].slice(0, 12);
  state.spinning = false;
  render();
  vibrate(50);
}

function setCombo(combo) {
  state.combo = combo;
  renderComboBar();
}

function render() {
  renderComboBar();
  renderSourceSelector();
  renderResult();
  renderHistory();
  renderSpinningBtn(state.spinning);
}

function renderComboBar() {
  const el = document.getElementById('combo-bar');
  if (!el) return;
  el.innerHTML = COMBOS.map(c =>
    '<button class="combo-seg ' + (state.combo === c.key ? 'active' : '') + '" data-combo="' + c.key + '">' + c.label + '</button>'
  ).join('');
}

function renderSourceSelector() {
  const el = document.getElementById('source-selector');
  if (!el) return;
  let html = '<button class="source-btn ' + (state.source === 'personal' ? 'active' : '') + '" data-source="personal">👤 个人菜单</button>';
  state.families.forEach(f => {
    html += '<button class="source-btn ' + (state.source === f._id ? 'active' : '') + '" data-source="' + f._id + '">🏠 ' + f.name + '</button>';
  });
  el.innerHTML = html;
}

function renderResult() {
  const el = document.getElementById('result-area');
  if (!el) return;
  const dishes = state.currentDishes;
  const spinning = state.spinning;

  if (!dishes.length) {
    el.innerHTML = '<div class="single-area"><div class="single-card placeholder"><span class="single-emoji">🍽️</span><span class="single-name">点击按钮开始</span></div></div>';
    return;
  }

  if (dishes.length === 1) {
    const d = dishes[0];
    el.innerHTML = '<div class="single-area ' + (spinning ? 'spinning' : '') + '"><div class="single-card">' +
      (d.image ? '<img class="single-img" src="' + d.image + '" alt="' + d.name + '" />' : '<span class="single-emoji">' + d.emoji + '</span>') +
      '<span class="single-name">' + d.name + '</span></div></div>';
  } else {
    const cards = dishes.map(d =>
      '<div class="multi-card">' +
      (d.image ? '<img class="multi-img" src="' + d.image + '" alt="' + d.name + '" />' : '<span class="multi-emoji">' + d.emoji + '</span>') +
      '<span class="multi-name">' + d.name + '</span></div>'
    ).join('');
    el.innerHTML = '<div class="multi-area ' + (spinning ? 'spinning' : '') + '">' + cards + '</div>';
  }
}

function renderHistory() {
  const el = document.getElementById('history-area');
  if (!el) return;
  if (!state.history.length) { el.innerHTML = ''; return; }
  const items = state.history.map(h =>
    '<div class="history-item"><span class="history-combo">' + h.comboLabel + '</span>' +
    (h.sourceLabel && h.sourceLabel !== '个人菜单' ? '<span class="history-source">' + h.sourceLabel + '</span>' : '') +
    h.dishes.map(d => '<span class="history-name">' + d.emoji + d.name + '</span>').join('') +
    '</div>'
  ).join('');
  el.innerHTML = '<span class="history-title">最近抽取</span><div class="history-list">' + items + '</div>';
}

function renderSpinningBtn(spinning) {
  const el = document.getElementById('btn-random');
  if (!el) return;
  el.disabled = spinning;
  el.classList.toggle('pressing', spinning);
  el.innerHTML = spinning ? '挑选中...' : '🎲 今天吃啥呀？';
}

async function loadFamilies() {
  try {
    state.families = getUserFamilies();
  } catch (e) {
    state.families = [];
  }
}

function setupEvents() {
  document.getElementById('combo-bar').addEventListener('click', function(e) {
    const btn = e.target.closest('.combo-seg');
    if (btn) setCombo(btn.dataset.combo);
  });
  document.getElementById('btn-random').addEventListener('click', randomDish);
  document.getElementById('source-selector').addEventListener('click', function(e) {
    const btn = e.target.closest('.source-btn');
    if (btn) switchSource(btn.dataset.source);
  });
}

function initIndexPage() {
  loadFamilies().then(function() {
    render();
    setupEvents();
  });
}

function refreshIndexFamilies() {
  loadFamilies();
}

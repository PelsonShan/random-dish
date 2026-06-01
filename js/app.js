// 主应用 — 路由、页面切换

var currentPage = '';
var currentParams = {};

var PAGES = {
  index:    { init: initIndexPage,    tab: 0 },
  manage:   { init: initManagePage,   tab: 1 },
  family:   { init: initFamilyPage,   tab: 2 },
  'family-detail': { init: initFamilyDetailPage, tab: -1 },
};

function initDefaultDishes() {
  var stored = getMyDishes();
  if (!stored || stored.length === 0) {
    var dishes = DEFAULT_DISHES.map(function(d, i) { return Object.assign({}, d, { id: i + 1 }); });
    saveMyDishes(dishes);
  }
}

function navigateTo(page, params) {
  params = params || {};
  var route = PAGES[page];
  if (!route) { navigateTo('index'); return; }

  currentPage = page;
  currentParams = params;

  var tabItems = document.querySelectorAll('.tab-item');
  tabItems.forEach(function(el, i) {
    el.classList.toggle('active', i === route.tab);
  });

  var idx = document.getElementById('page-index');
  var mgr = document.getElementById('page-manage');
  var fam = document.getElementById('page-family');
  var famd = document.getElementById('page-family-detail');

  if (idx) idx.style.display = page === 'index' ? 'flex' : 'none';
  if (mgr) mgr.style.display = page === 'manage' ? 'flex' : 'none';
  if (fam) fam.style.display = page === 'family' ? 'flex' : 'none';
  if (famd) famd.style.display = page === 'family-detail' ? 'flex' : 'none';

  var tabBar = document.getElementById('tab-bar');
  if (tabBar) tabBar.style.display = (page === 'family-detail') ? 'none' : '';

  var backBtn = document.getElementById('back-btn');
  if (backBtn) backBtn.style.display = (page === 'family-detail') ? 'block' : 'none';

  document.title = page === 'family-detail' ? (params.familyName || '家庭详情') : '今天吃啥呀？';

  route.init(params);
}

function navigateBack() {
  if (currentPage === 'family-detail') { navigateTo('family'); }
  else { navigateTo('index'); }
}

function handleHashChange() {
  var hash = location.hash.replace('#', '') || 'index';
  var parts = hash.split('?');
  var page = parts[0];
  var params = {};
  if (parts[1]) {
    parts[1].split('&').forEach(function(pair) {
      var kv = pair.split('=');
      params[kv[0]] = decodeURIComponent(kv[1] || '');
    });
  }
  navigateTo(page, params);
}

function setupGlobalEvents() {
  var tabBar = document.getElementById('tab-bar');
  if (tabBar) {
    tabBar.addEventListener('click', function(e) {
      var tab = e.target.closest('.tab-item');
      if (!tab) return;
      var pages = ['index', 'manage', 'family'];
      navigateTo(pages[parseInt(tab.dataset.tab)]);
    });
  }

  var backBtn = document.getElementById('back-btn');
  if (backBtn) backBtn.addEventListener('click', navigateBack);

  var toast = document.getElementById('toast');
  if (toast) {
    toast.addEventListener('transitionend', function() {
      if (!this.classList.contains('show')) this.textContent = '';
    });
  }
}

// 启动
initDefaultDishes();
window.addEventListener('hashchange', handleHashChange);

function boot() {
  setupGlobalEvents();
  handleHashChange();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

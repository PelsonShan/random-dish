// Toast / Modal / 工具函数 — 替代微信 wx.showToast / wx.showModal / wx.showLoading

let toastTimer = null;
let loadingVisible = false;

function showToast(msg, icon = 'success') {
  const el = document.getElementById('toast');
  if (!el) return;
  clearTimeout(toastTimer);
  el.textContent = (icon === 'none' ? '' : icon === 'success' ? '✅ ' : '') + msg;
  el.classList.add('show');
  toastTimer = setTimeout(() => el.classList.remove('show'), 2000);
}

function showLoading(msg = '加载中...') {
  const el = document.getElementById('loading-overlay');
  if (!el) return;
  el.querySelector('.loading-text').textContent = msg;
  el.classList.add('show');
  loadingVisible = true;
}

function hideLoading() {
  const el = document.getElementById('loading-overlay');
  if (!el) return;
  el.classList.remove('show');
  loadingVisible = false;
}

function showModal(title, content) {
  return new Promise((resolve) => {
    const overlay = document.getElementById('modal-overlay');
    const titleEl = document.getElementById('modal-title');
    const contentEl = document.getElementById('modal-content');
    const cancelBtn = document.getElementById('modal-cancel');
    const confirmBtn = document.getElementById('modal-confirm');

    if (!overlay) { resolve(false); return; }

    titleEl.textContent = title;
    contentEl.textContent = content;

    overlay.classList.add('show');

    function cleanup(result) {
      overlay.classList.remove('show');
      cancelBtn.removeEventListener('click', onCancel);
      confirmBtn.removeEventListener('click', onConfirm);
      resolve(result);
    }

    function onCancel() { cleanup(false); }
    function onConfirm() { cleanup(true); }

    cancelBtn.addEventListener('click', onCancel);
    confirmBtn.addEventListener('click', onConfirm);
  });
}

function vibrate(pattern = 20) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

function pickRandom(arr, count) {
  const pool = [...arr];
  const result = [];
  for (let i = 0; i < count && pool.length; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    result.push(pool.splice(idx, 1)[0]);
  }
  return result;
}

export { showToast, showLoading, hideLoading, showModal, vibrate, pickRandom };

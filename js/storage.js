// localStorage wrapper — 模拟微信小程序 storage + 云数据库

const STORAGE_KEY = 'my_dishes';
const DB_PREFIX = 'rd_db_';

// ---- 个人菜品 ----
function getMyDishes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* ignore */ }
  return [];
}

function saveMyDishes(dishes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dishes));
}

// ---- 模拟云数据库 ----
function getCollection(name) {
  try {
    const raw = localStorage.getItem(DB_PREFIX + name);
    return raw ? JSON.parse(raw) : [];
  } catch (e) { return []; }
}

function saveCollection(name, data) {
  localStorage.setItem(DB_PREFIX + name, JSON.stringify(data));
}

// ---- 用户身份 ----
function getUserId() {
  let uid = localStorage.getItem('rd_user_id');
  if (!uid) {
    uid = 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    localStorage.setItem('rd_user_id', uid);
  }
  return uid;
}

export { getMyDishes, saveMyDishes, getCollection, saveCollection, getUserId, STORAGE_KEY };

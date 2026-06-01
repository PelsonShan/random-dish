// 家庭服务 — 模拟微信云函数（本地 localStorage 实现）
// 注意：数据仅保存在当前浏览器中，无法跨设备共享

import { getCollection, saveCollection, getUserId } from '../storage.js';

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// 创建家庭
function createFamily(name) {
  const openId = getUserId();
  if (!name || !name.trim()) {
    return { success: false, error: '家庭名称不能为空' };
  }

  let inviteCode;
  let families = getCollection('families');
  do {
    inviteCode = generateCode();
  } while (families.some(f => f.inviteCode === inviteCode));

  const now = Date.now();
  const newFamily = {
    _id: 'f_' + now.toString(36) + Math.random().toString(36).slice(2, 6),
    name: name.trim(),
    creatorId: openId,
    inviteCode,
    inviteExpire: now + 7 * 24 * 60 * 60 * 1000,
    memberCount: 1,
    createTime: now
  };

  families.push(newFamily);
  saveCollection('families', families);

  const members = getCollection('family_members');
  members.push({
    _id: 'm_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    familyId: newFamily._id,
    userId: openId,
    role: 'owner',
    nickname: '',
    joinTime: now
  });
  saveCollection('family_members', members);

  return { success: true, familyId: newFamily._id, inviteCode, inviteExpire: newFamily.inviteExpire };
}

// 加入家庭
function joinFamily(inviteCode) {
  const openId = getUserId();
  if (!inviteCode) return { success: false, error: '邀请码不能为空' };

  const families = getCollection('families');
  const family = families.find(f => f.inviteCode === inviteCode.toUpperCase());
  if (!family) return { success: false, error: '邀请码无效' };
  if (family.inviteExpire && family.inviteExpire < Date.now()) {
    return { success: false, error: '邀请码已过期' };
  }

  const members = getCollection('family_members');
  if (members.some(m => m.familyId === family._id && m.userId === openId)) {
    return { success: false, error: '你已在该家庭中' };
  }

  members.push({
    _id: 'm_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    familyId: family._id,
    userId: openId,
    role: 'member',
    nickname: '',
    joinTime: Date.now()
  });
  saveCollection('family_members', members);

  const famIdx = families.findIndex(f => f._id === family._id);
  families[famIdx].memberCount = (families[famIdx].memberCount || 1) + 1;
  saveCollection('families', families);

  return { success: true, familyId: family._id, name: family.name };
}

// 获取用户的所有家庭
function getUserFamilies() {
  const openId = getUserId();
  const members = getCollection('family_members');
  const families = getCollection('families');
  const dishes = getCollection('family_dishes');
  const roleMap = {};

  const userMembers = members.filter(m => m.userId === openId);
  userMembers.forEach(m => { roleMap[m.familyId] = m.role; });

  return families
    .filter(f => roleMap[f._id])
    .map(f => ({
      ...f,
      role: roleMap[f._id],
      dishCount: dishes.filter(d => d.familyId === f._id).length
    }));
}

// 获取家庭详情
function getFamilyDetail(familyId) {
  const families = getCollection('families');
  const members = getCollection('family_members');
  const dishes = getCollection('family_dishes');
  const openId = getUserId();

  const family = families.find(f => f._id === familyId);
  if (!family) return null;

  const familyMembers = members.filter(m => m.familyId === familyId);
  const myMember = familyMembers.find(m => m.userId === openId);
  const myRole = myMember ? myMember.role : 'member';
  const familyDishes = dishes
    .filter(d => d.familyId === familyId)
    .sort((a, b) => (b.createTime || 0) - (a.createTime || 0));

  return { family, inviteCode: family.inviteCode, myRole, myOpenId: openId, members: familyMembers, allDishes: familyDishes };
}

// 添加家庭菜品
function addFamilyDish(familyId, dish) {
  const dishes = getCollection('family_dishes');
  const newDish = {
    _id: 'd_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    familyId,
    ...dish,
    addedBy: getUserId(),
    createTime: Date.now()
  };
  dishes.push(newDish);
  saveCollection('family_dishes', dishes);
  return newDish;
}

// 删除家庭菜品
function deleteFamilyDish(dishId) {
  const dishes = getCollection('family_dishes');
  saveCollection('family_dishes', dishes.filter(d => d._id !== dishId));
}

// 成员管理
function manageMember(familyId, targetUserId, action) {
  const openId = getUserId();
  const members = getCollection('family_members');
  const families = getCollection('families');

  const caller = members.find(m => m.familyId === familyId && m.userId === openId);
  if (!caller) return { success: false, error: '你不是该家庭成员' };

  const target = members.find(m => m.familyId === familyId && m.userId === targetUserId);
  if (!target) return { success: false, error: '目标用户不在该家庭中' };

  switch (action) {
    case 'setAdmin':
      if (caller.role !== 'owner') return { success: false, error: '仅创建者可设置管理员' };
      if (target.role === 'owner') return { success: false, error: '不能修改创建者角色' };
      target.role = 'admin';
      saveCollection('family_members', members);
      return { success: true };

    case 'revokeAdmin':
      if (caller.role !== 'owner') return { success: false, error: '仅创建者可取消管理员' };
      if (target.role !== 'admin') return { success: false, error: '该成员不是管理员' };
      target.role = 'member';
      saveCollection('family_members', members);
      return { success: true };

    case 'remove':
      if (caller.role !== 'owner') return { success: false, error: '仅创建者可移除成员' };
      if (target.role === 'owner') return { success: false, error: '不能移除创建者' };
      saveCollection('family_members', members.filter(m => m._id !== target._id));
      const fam = families.find(f => f._id === familyId);
      if (fam) { fam.memberCount = Math.max(0, fam.memberCount - 1); }
      saveCollection('families', families);
      return { success: true };

    case 'leave':
      if (targetUserId !== openId) return { success: false, error: '只能自己退出' };
      if (target.role === 'owner') return { success: false, error: '创建者不能退出，请先转让或解散家庭' };
      saveCollection('family_members', members.filter(m => m._id !== target._id));
      const fam2 = families.find(f => f._id === familyId);
      if (fam2) { fam2.memberCount = Math.max(0, fam2.memberCount - 1); }
      saveCollection('families', families);
      return { success: true };

    default:
      return { success: false, error: '未知操作' };
  }
}

// 生成新邀请码
function generateInviteCode(familyId) {
  const openId = getUserId();
  const members = getCollection('family_members');
  const families = getCollection('families');

  const caller = members.find(m => m.familyId === familyId && m.userId === openId);
  if (!caller || (caller.role !== 'owner' && caller.role !== 'admin')) {
    return { success: false, error: '无权限' };
  }

  let code;
  do {
    code = generateCode();
  } while (families.some(f => f.inviteCode === code));

  const fam = families.find(f => f._id === familyId);
  if (fam) {
    fam.inviteCode = code;
    fam.inviteExpire = Date.now() + 7 * 24 * 60 * 60 * 1000;
    saveCollection('families', families);
  }

  return { success: true, inviteCode: code, inviteExpire: fam ? fam.inviteExpire : 0 };
}

export { createFamily, joinFamily, getUserFamilies, getFamilyDetail, addFamilyDish, deleteFamilyDish, manageMember, generateInviteCode };

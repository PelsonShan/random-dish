# 🍽️ 随机开饭 (Random Dish Picker)

帮你解决"今天吃什么"的终极难题！从你的菜品库中随机抽取搭配，告别选择困难。

> 此项目由微信小程序版本改造而来，转为纯 Web 应用，无需任何后端即可运行。

## ✨ 功能

- **🎲 随机开饭** — 支持多种搭配（单菜/两菜/一菜一汤/两菜一汤/三菜一汤），带动画抽取效果
- **📋 菜品管理** — 添加、删除自定义菜品，从 43 道热门菜品一键添加
- **📸 图片支持** — 为菜品拍照或从相册选择图片
- **👨‍👩‍👧 家庭共享** — 创建家庭、邀请码加入，共享家庭菜单（本地存储模拟）
- **📜 抽取历史** — 记录最近 12 次抽取结果

## 🚀 快速开始

直接用浏览器打开 `index.html` 即可，或部署到任意静态托管服务：

```bash
# 方式一：本地运行
open index.html

# 方式二：使用任意 HTTP 服务器
python3 -m http.server 3000
# 然后打开 http://localhost:3000
```

## 📁 项目结构

```
web/
├── index.html          # 主入口
├── css/
│   └── style.css       # 样式
├── js/
│   ├── app.js          # 主应用、路由
│   ├── data.js         # 菜品数据
│   ├── storage.js      # localStorage 封装
│   ├── utils.js        # Toast/Modal/工具函数
│   ├── pages/
│   │   ├── index.js    # 随机开饭页
│   │   ├── manage.js   # 菜品管理页
│   │   ├── family.js   # 家庭列表页
│   │   └── family-detail.js  # 家庭详情页
│   └── services/
│       └── family.js   # 家庭服务（本地模拟）
└── img/
    ├── icon.png
    └── icon_1024.png
```

## ⚠️ 注意事项

- 家庭共享功能使用 `localStorage` 模拟，数据仅保存在当前浏览器，**无法跨设备共享**
- 菜品图片以 Base64 格式存储在 `localStorage` 中，大量图片可能占用较多存储空间

## 📝 技术说明

原项目为微信小程序，使用了：
- `wx.setStorageSync/getStorageSync` → `localStorage`
- `wx.showToast/showModal` → 自定义 Toast/Modal 组件
- `wx.cloud.database()` → 本地 localStorage 模拟
- `wx.navigateTo` → Hash 路由
- `wx.chooseImage` → HTML `<input type="file">`
- `.wxml` 模板 → JavaScript 直接操作 DOM
- `.wxss` (rpx 单位) → CSS (px/rem)

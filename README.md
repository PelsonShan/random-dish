# Random Dish - 随机菜品

前后端一体化的随机菜品推荐应用。

## 项目结构

```
random-dish/
├── random-dish-backend/          # Spring Boot 后端 (Java 17)
│   ├── pom.xml
│   └── src/main/
│       ├── java/                 # Java 源码
│       └── resources/
│           ├── application.yml   # 应用配置
│           ├── bootstrap.yml     # 启动配置
│           └── static/           # 前端构建产物
├── random-dish-frontend/         # React 前端 (Vite + TS)
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
├── Dockerfile                    # 多阶段 Docker 构建
├── build.sh                      # 本地构建脚本
└── .gitignore
```

## 本地开发

### 后端
```bash
cd random-dish-backend
mvn spring-boot:run -DskipTests
```

### 前端
```bash
cd random-dish-frontend
npm install
npm run dev
```

### 一键构建
```bash
./build.sh
```

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `PORT` | 服务端口 | `81` |
| `DB_HOST` | PostgreSQL 地址 | `localhost` |
| `DB_PORT` | PostgreSQL 端口 | `5432` |
| `DB_NAME` | 数据库名 | `random_dish` |
| `DB_USER` | 数据库用户 | `postgres` |
| `DB_PASSWORD` | 数据库密码 | `postgres` |
| `UPLOAD_DIR` | 文件上传目录 | `uploads` |

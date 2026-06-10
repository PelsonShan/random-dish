#!/bin/bash
set -e

echo "===== 构建 Random Dish ====="

# 1. 编译前端
echo ">>> [1/4] 构建前端..."
cd random-dish-frontend
npm ci
npm run build
cd ..

# 2. 复制前端到后端静态目录
echo ">>> [2/4] 复制前端产物到后端..."
rm -rf random-dish-backend/src/main/resources/static/*
cp -r random-dish-frontend/dist/* random-dish-backend/src/main/resources/static/

# 3. 编译后端
echo ">>> [3/4] 构建后端 JAR..."
cd random-dish-backend
JAVA_HOME=/Users/pelsondan/Library/Java/JavaVirtualMachines/ms-17.0.14/Contents/Home \
  mvn clean package -DskipTests
cd ..

# 4. 输出结果
echo ">>> [4/4] 构建完成!"
ls -lh random-dish-backend/target/random-dish-*.jar

# Stage 1: Build frontend
FROM node:20-alpine AS frontend
WORKDIR /app/frontend
COPY random-dish-frontend/package*.json ./
RUN npm ci
COPY random-dish-frontend/ ./
RUN npm run build

# Stage 2: Build backend
FROM maven:3.9-eclipse-temurin-17 AS backend
WORKDIR /app/backend
COPY random-dish-backend/pom.xml ./
RUN mvn dependency:go-offline -B
COPY random-dish-backend/src ./src
COPY --from=frontend /app/frontend/dist ./src/main/resources/static
RUN mvn clean package -DskipTests -B

# Stage 3: Runtime
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=backend /app/backend/target/random-dish-*.jar ./app.jar
EXPOSE 81
CMD ["java", "-jar", "app.jar"]

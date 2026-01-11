# Stage 1: Build
FROM eclipse-temurin:25-jdk AS builder
WORKDIR /app

# Copy gradle wrapper and config
COPY gradlew .
COPY gradle gradle
COPY build.gradle.kts .
COPY settings.gradle.kts .

# Grant execution rights
RUN chmod +x ./gradlew

# Copy source
COPY src src

# Build
RUN ./gradlew bootJar --no-daemon

# Stage 2: Run
FROM eclipse-temurin:25-jre
WORKDIR /app
COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "--enable-preview", "-jar", "app.jar"]

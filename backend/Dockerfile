# ビルド用ステージ: Mavenでjarをビルドする
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline -q

COPY src src
RUN ./mvnw clean package -DskipTests -q

# 実行用ステージ: ビルドしたjarだけを積んだ軽量イメージ
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/mochimono-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

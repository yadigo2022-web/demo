FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY . .

RUN chmod +x gradlew

RUN ./gradlew bootJar

EXPOSE 8081

ENTRYPOINT ["java","-jar","build/libs/demo-0.0.1-SNAPSHOT.jar"]
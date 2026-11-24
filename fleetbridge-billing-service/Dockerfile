FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
ARG JAR_FILE=target/fleetbridge-billing-service-1.0.0-SNAPSHOT.jar
COPY ${JAR_FILE} app.jar
ENV JAVA_OPTS="-XX:+UseG1GC -XX:MaxRAMPercentage=75.0"
EXPOSE 8086
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]

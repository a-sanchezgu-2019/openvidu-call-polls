# Build Backend
FROM maven:3.8.4-openjdk-17 AS back_build

WORKDIR /usr/share/openvidu-call-polls-back
COPY openvidu-call-back-java/pom.xml /usr/share/openvidu-call-polls-back/pom.xml
RUN mvn clean && mvn -B -f pom.xml dependency:resolve
COPY openvidu-call-back-java/src /usr/share/openvidu-call-polls-back/src
RUN mvn package

# Run Packed App
FROM eclipse-temurin:17-jre-alpine

WORKDIR /usr/share/openvidu-call-polls
ENV SERVER_PORT=${SERVER_PORT:-5000}
ENV OPENVIDU_URL=${OPENVIDU_URL:-http://openvidu:4443}
ENV OPENVIDU_SECRET=${OPENVIDU_SECRET:-MY_SECRET}
COPY --from=back_build /usr/share/openvidu-call-polls-back/target/openvidu-call-back-java.jar /usr/share/openvidu-call-polls/openvidu-call-polls.jar
EXPOSE ${SERVER_PORT:-5000}

CMD ["java", "-jar", "openvidu-call-polls.jar"]
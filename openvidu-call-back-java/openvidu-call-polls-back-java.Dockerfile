FROM maven:3.8.4-openjdk-17

WORKDIR /usr/share/openvidu-call-polls/java-backend

COPY pom.xml /usr/share/openvidu-call-polls/java-backend/pom.xml
RUN mvn clean && mvn -B -f pom.xml dependency:resolve
COPY src /usr/share/openvidu-call-polls/java-backend/src

EXPOSE 5000
CMD ["mvn", "spring-boot:run"]
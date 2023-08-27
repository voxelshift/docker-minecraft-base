FROM eclipse-temurin:17-jre

ARG VELOCITY_DOWNLOAD_URL

RUN groupadd -r minecraft && useradd --no-log-init -r -g minecraft minecraft
USER minecraft

WORKDIR /opt/minecraft

RUN wget $VELOCITY_DOWNLOAD_URL -O velocity.jar

EXPOSE 25565/tcp

ENTRYPOINT java -XX:InitialRAMPercentage=75 -XX:MaxRAMPercentage=75 -XX:+UseG1GC -XX:G1HeapRegionSize=4M \
  -XX:+UnlockExperimentalVMOptions -XX:+ParallelRefProcEnabled -XX:+AlwaysPreTouch -XX:MaxInlineLevel=15 \
  -jar velocity.jar

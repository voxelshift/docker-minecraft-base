FROM eclipse-temurin:17-jre

ARG FABRIC_DOWNLOAD_URL

RUN groupadd -r minecraft && useradd --no-log-init -r -g minecraft minecraft
USER minecraft

WORKDIR /opt/minecraft

RUN wget $FABRIC_DOWNLOAD_URL -O fabric.jar

EXPOSE 25565/tcp

ENTRYPOINT java -XX:InitialRAMPercentage=75 -XX:MaxRAMPercentage=75 -XX:+UseG1GC -XX:+ParallelRefProcEnabled \
  -XX:MaxGCPauseMillis=200 -XX:+UnlockExperimentalVMOptions  -XX:+DisableExplicitGC -XX:+AlwaysPreTouch \
  -XX:G1NewSizePercent=30 -XX:G1MaxNewSizePercent=40 -XX:G1HeapRegionSize=8M -XX:G1ReservePercent=20 \
  -XX:G1HeapWastePercent=5 -XX:G1MixedGCCountTarget=4 -XX:InitiatingHeapOccupancyPercent=15 \
  -XX:G1MixedGCLiveThresholdPercent=90 -XX:G1RSetUpdatingPauseTimePercent=5 -XX:SurvivorRatio=32 \
  -XX:+PerfDisableSharedMem -XX:MaxTenuringThreshold=1 -jar fabric.jar --nogui

const { Kafka } = require("kafkajs");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const kafka = new Kafka({
  clientId: "worker",
  brokers: ["kafka:9092"],
});

const consumer = kafka.consumer({ groupId: "video-group" });

function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(stderr);
      resolve(stdout);
    });
  });
}

async function processVideo({ id, inputPath }) {
  const outputDir = `/videos/${id}`;
  fs.mkdirSync(outputDir, { recursive: true });

  console.log("🎬 encoding:", id);

  try {
    // =========================
    // 🔥 144p
    // =========================
    await run(`
ffmpeg -y -i ${inputPath} \
-vf scale=256:144 \
-c:v libx264 -b:v 200k \
-c:a aac -b:a 64k \
-f hls \
-hls_time 4 \
-hls_playlist_type vod \
-hls_segment_filename ${outputDir}/144p_%03d.ts \
${outputDir}/144p.m3u8
    `);

    // =========================
    // 🔥 360p
    // =========================
    await run(`
ffmpeg -y -i ${inputPath} \
-vf scale=640:360 \
-c:v libx264 -b:v 800k \
-c:a aac -b:a 128k \
-f hls \
-hls_time 4 \
-hls_playlist_type vod \
-hls_segment_filename ${outputDir}/360p_%03d.ts \
${outputDir}/360p.m3u8
    `);

    // =========================
    // 🔥 720p
    // =========================
    await run(`
ffmpeg -y -i ${inputPath} \
-vf scale=1280:720 \
-c:v libx264 -b:v 2800k \
-c:a aac -b:a 128k \
-f hls \
-hls_time 4 \
-hls_playlist_type vod \
-hls_segment_filename ${outputDir}/720p_%03d.ts \
${outputDir}/720p.m3u8
    `);

    // =========================
    // 🔥 1080p
    // =========================
    await run(`
ffmpeg -y -i ${inputPath} \
-vf scale=1920:1080 \
-c:v libx264 -b:v 5000k \
-c:a aac -b:a 192k \
-f hls \
-hls_time 4 \
-hls_playlist_type vod \
-hls_segment_filename ${outputDir}/1080p_%03d.ts \
${outputDir}/1080p.m3u8
    `);

    // =========================
    // 🔥 MASTER PLAYLIST (CLAVE)
    // =========================
    const master = `#EXTM3U

#EXT-X-STREAM-INF:BANDWIDTH=200000,RESOLUTION=256x144
144p.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
360p.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720
720p.m3u8

#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080
1080p.m3u8
`;

    fs.writeFileSync(path.join(outputDir, "master.m3u8"), master);

    console.log("✅ encoding listo:", id);

    await fetch(`http://api:3000/videos/${id}/ready`, {
      method: "POST",
    });

    console.log("📡 API notificada");
  } catch (err) {
    console.error("❌ encoding falló:", err);
  }
}

async function start() {
  await consumer.connect();
  await consumer.subscribe({ topic: "video_uploaded" });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const payload = JSON.parse(message.value.toString());
      console.log("📥 evento:", payload);

      await processVideo(payload);
    },
  });
}

start();

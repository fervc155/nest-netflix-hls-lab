import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

export default function Player({ url }) {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!url) return;

    const video = videoRef.current;

    // 🔥 destruir instancia previa
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const hls = new Hls({
      enableWorker: true,
      maxBufferLength: 10,
      maxMaxBufferLength: 20,
      backBufferLength: 60,
      smoothSwitching: true,

      // 🔥 CLAVE: deja que ajuste calidad automáticamente
      capLevelToPlayerSize: true,

      // 🔥 IMPORTANTE: habilita ABR inteligente
      abrEwmaFastLive: 3,
      abrEwmaSlowLive: 9,
      abrEwmaFastVoD: 3,
      abrEwmaSlowVoD: 9,
    });

    hlsRef.current = hls;

    hls.loadSource(url);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      const levels = hls.levels;
      setLevels(levels);

      // 🚀 empezar en la mejor calidad disponible
      const highest = levels.length - 1;
      hls.currentLevel = highest;
      setCurrentLevel(highest);

      video.play();
    });

    return () => {
      hls.destroy();
      hlsRef.current = null;
    };
  }, [url]);

  const changeQuality = (level) => {
    const hls = hlsRef.current;
    if (!hls) return;

    // 🚫 evitar re-aplicar misma calidad
    if (hls.currentLevel === level) return;

    setLoading(true);

    if (level === -1) {
      hls.currentLevel = -1; // AUTO
      setCurrentLevel(-1);
    } else {
      hls.currentLevel = level;
      setCurrentLevel(level);
    }

    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div style={{ position: "relative" }}>
      <video
        ref={videoRef}
        controls
        style={{ width: "800px", background: "black" }}
      />

      {/* 🔥 LOADING */}
      {loading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "800px",
            height: "450px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.5)",
            color: "white",
            fontSize: 18,
          }}
        >
          ⏳ Cambiando calidad...
        </div>
      )}

      {/* 🔥 CONTROLES */}
      {levels.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <button onClick={() => changeQuality(-1)}>Auto</button>

          {levels.map((level, index) => (
            <button
              key={index}
              onClick={() => changeQuality(index)}
              style={{
                fontWeight: currentLevel === index ? "bold" : "normal",
                marginLeft: 5,
              }}
            >
              {level.height}p
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

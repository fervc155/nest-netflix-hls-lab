import { useState } from "react";
import Player from "./Player";

export default function App() {
  const [videoId, setVideoId] = useState("");
  const [url, setUrl] = useState(null);

  const loadVideo = async () => {
    const res = await fetch(`http://localhost:3000/stream/${videoId}`);
    const data = await res.json();

    console.log(data.url);

    setUrl(data.url);
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Netflix Lab</h2>

      <input
        placeholder="video id"
        value={videoId}
        onChange={(e) => setVideoId(e.target.value)}
      />

      <button onClick={loadVideo}>Load</button>

      <Player url={url} />
    </div>
  );
}

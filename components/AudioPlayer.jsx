import { PauseIcon, PlayIcon } from "@heroicons/react/outline";
import { useEffect, useRef, useState } from "react";

const formWaveSurferOptions = (ref) => ({
  container: ref,
  waveColor: "#1e293b",
  progressColor: "#eee",
  cursorColor: "transparent",
  barWidth: 3,
  barRadius: 3,
  barHeight: 1,
  barMinHeight: 1,
  responsive: true,
  height: 40,
  normalize: true,
  partialRender: true,
});

export default function AudioPlayer({ url }) {
  const waveformRef = useRef(null);
  const wavesurfer = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    create();
    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const create = async () => {
    const WaveSurfer = (await import("wavesurfer.js")).default;

    const options = formWaveSurferOptions(waveformRef.current);
    wavesurfer.current = WaveSurfer.create(options);

    wavesurfer.current.load(url);
  };

  const handlePlayPause = () => {
    setPlaying(!playing);
    wavesurfer.current.playPause();
  };

  return (
    <div className="flex flex-row justify-center gap-2 content-center mx-1 my-2 h-10 w-full bg-transparent z-10">
      <button onClick={() => handlePlayPause()}>
        {!playing ? (
          <PlayIcon className="h-8 w-8" />
        ) : (
          <PauseIcon className="h-8 w-8" />
        )}
      </button>
      <div className="w-40 h-20" id="waveform" ref={waveformRef} />
      <audio id="track" src={url} />
    </div>
  );
}

import { useCallStateHooks } from "@stream-io/video-react-sdk";
import {
  useEffect,
  useState,
  type CSSProperties,
  type PropsWithChildren,
} from "react";
import { useAgentParticipant } from "./useAgentParticipant";

import "./AudioVisualizer.css";

const listeningCooldownMs = 1000;

export function AudioVisualizer() {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const [activity, setActivity] = useState<"listening" | "speaking">(
    "speaking"
  );
  const speaker = participants.find((p) => p.isSpeaking);
  const agent = useAgentParticipant();
  const mediaStream =
    activity === "listening"
      ? participants.find((p) => p.isLocalParticipant)?.audioStream
      : agent?.audioStream;

  useEffect(() => {
    if (!speaker && activity === "listening") {
      const timeout = setTimeout(
        () => setActivity("speaking"),
        listeningCooldownMs
      );
      return () => clearTimeout(timeout);
    }

    const isUserSpeaking = speaker?.isLocalParticipant;
    setActivity(isUserSpeaking ? "listening" : "speaking");
  }, [speaker, activity]);

  return (
    <div className="audio-visualizer">
      <Volumeter mediaStream={mediaStream ?? null}>
        <Aura activity={activity} />
      </Volumeter>
    </div>
  );
}

function Volumeter(
  props: PropsWithChildren<{ mediaStream: MediaStream | null }>
) {
  const volume = useMediaStreamVolume(props.mediaStream);

  return (
    <div
      className="audio-visualizer__volumeter"
      style={
        {
          "--volumeter-scale": Math.min(1 + volume, 1.1),
          "--volumeter-brightness": Math.max(Math.min(1 + volume, 1.2), 1),
        } as CSSProperties
      }
    >
      {props.children}
    </div>
  );
}

function Aura(props: { activity: "listening" | "speaking" }) {
  return (
    <div
      className={`audio-visualizer__aura audio-visualizer__aura_${props.activity}`}
    />
  );
}

function useMediaStreamVolume(mediaStream: MediaStream | null) {
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    if (!mediaStream) {
      setVolume(0);
      return;
    }

    let audioContext: AudioContext;

    const promise = (async () => {
      audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(mediaStream);
      const analyser = audioContext.createAnalyser();
      const data = new Float32Array(analyser.fftSize);
      source.connect(analyser);

      const updateVolume = () => {
        analyser.getFloatTimeDomainData(data);
        const volume = Math.sqrt(
          data.reduce((acc, amp) => acc + (amp * amp) / data.length, 0)
        );
        setVolume(volume);
        return requestAnimationFrame(updateVolume);
      };

      return updateVolume();
    })();

    return () => {
      const audioContextToClose = audioContext;
      promise.then((handle) => {
        cancelAnimationFrame(handle);
        audioContextToClose.close();
      });
    };
  }, [mediaStream]);

  return volume;
}

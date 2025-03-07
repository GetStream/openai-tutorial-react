import {
  Call,
  CancelCallButton,
  ParticipantsAudio,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
  ToggleAudioPublishingButton,
  useCall,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import { useState } from "react";
import { AudioVisualizer } from "./AudioVisualizer";
import { fetchCallCredentials, joinCall } from "./join";

import "@stream-io/video-react-sdk/dist/css/styles.css";

const credentialsPromise = fetchCallCredentials();

export default function App() {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [status, setStatus] = useState<"start" | "joining" | "joined">("start");

  const handleJoin = () => {
    setStatus("joining");
    credentialsPromise
      .then((credentials) => joinCall(credentials))
      .then(([client, call]) => {
        setClient(client);
        setCall(call);
        setStatus("joined");
      })
      .catch(() => {
        console.error("Could not join call");
        setStatus("start");
      });
  };

  const handleLeave = () => {
    setClient(null);
    setCall(null);
    setStatus("start");
  };

  return (
    <>
      {status === "start" && (
        <button className="click-to-talk" onClick={handleJoin}>
          Click to Talk to AI
        </button>
      )}
      {status === "joining" && <>Waiting for agent to join...</>}
      {client && call && (
        <StreamVideo client={client}>
          <StreamCall call={call}>
            <CallLayout onLeave={handleLeave} />
          </StreamCall>
        </StreamVideo>
      )}
    </>
  );
}

function CallLayout(props: { onLeave?: () => void }) {
  const call = useCall();
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();

  return (
    <>
      <StreamTheme>
        <ParticipantsAudio participants={participants} />
        <div className="call-controls">
          <ToggleAudioPublishingButton menuPlacement="bottom-end" />
          <CancelCallButton
            onClick={() => {
              call?.endCall();
              props.onLeave?.();
            }}
          />
        </div>
      </StreamTheme>
      <AudioVisualizer />
    </>
  );
}

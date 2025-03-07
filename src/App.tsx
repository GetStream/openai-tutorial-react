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
import { useEffect, useRef, useState } from "react";
import { AgentCaptions } from "./AgentCaptions";
import { AudioVisualizer } from "./AudioVisualizer";
import { fetchCallCredentials, joinCall } from "./join";
import { useAgentParticipant } from "./useAgentParticipant";

import "@stream-io/video-react-sdk/dist/css/styles.css";

const credentialsPromise = fetchCallCredentials();

export default function App() {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [status, setStatus] = useState<
    "start" | "joining" | "joined-with-agent" | "end"
  >("start");

  const handleJoin = () => {
    setStatus("joining");
    credentialsPromise
      .then((credentials) => joinCall(credentials))
      .then(([client, call]) => {
        setClient(client);
        setCall(call);
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
      {status === "joining" && (
        <div className="statusbar statusbar_bottom">
          Waiting for agent to join...
        </div>
      )}
      {client && call && (
        <StreamVideo client={client}>
          <StreamCall call={call}>
            <CallLayout
              onAgentJoined={() => setStatus("joined-with-agent")}
              onLeave={handleLeave}
            />
          </StreamCall>
        </StreamVideo>
      )}
    </>
  );
}

function CallLayout(props: {
  onAgentJoined?: () => void;
  onLeave?: () => void;
}) {
  const call = useCall();
  const { useParticipants, useMicrophoneState } = useCallStateHooks();
  const participants = useParticipants();
  const agentParticipant = useAgentParticipant();
  const { isSpeakingWhileMuted } = useMicrophoneState();
  const onAgentJoinedRef = useRef(props.onAgentJoined);
  onAgentJoinedRef.current = props.onAgentJoined;

  useEffect(() => {
    if (agentParticipant) {
      onAgentJoinedRef.current?.();
    }
  }, [agentParticipant]);

  return (
    <>
      <StreamTheme>
        <ParticipantsAudio participants={participants} />
        {isSpeakingWhileMuted && (
          <div className="statusbar statusbar_top">
            You are muted. Unmute to speak to AI
          </div>
        )}
        <AgentCaptions />
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
      {agentParticipant && <AudioVisualizer />}
    </>
  );
}

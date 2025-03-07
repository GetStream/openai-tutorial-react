import { type CallClosedCaption, useCall } from "@stream-io/video-react-sdk";
import { useEffect, useState } from "react";
import { useAgentParticipant } from "./useAgentParticipant";

import "./AgentCaptions.css";

const captionTtlMs = 15_000;

export function AgentCaptions() {
  const call = useCall();
  const [captions, setCaptions] = useState<
    Array<CallClosedCaption & { isExiting: boolean }>
  >([]);
  const agentParticipantId = useAgentParticipant()?.userId;

  useEffect(() => {
    if (!call) return;
    let cancel = false;

    const unlisten = call.on("call.closed_caption", (event) => {
      const caption = { ...event.closed_caption, isExiting: false };
      if (caption.speaker_id !== agentParticipantId) return;
      setCaptions((captions) =>
        [
          caption,
          ...captions.filter((c) => c.start_time !== caption.start_time),
        ].slice(0, 6)
      );
      setTimeout(() => {
        if (!cancel) {
          setCaptions((captions) =>
            captions.map((c) => (c === caption ? { ...c, isExiting: true } : c))
          );
        }
      }, captionTtlMs);
    });

    return () => {
      cancel = true;
      unlisten();
    };
  }, [call, agentParticipantId]);

  return (
    <div className="ai-captions">
      {captions.map((caption) => (
        <div
          key={caption.start_time}
          className="ai-captions__caption"
          data-exiting={caption.isExiting ? "" : undefined}
          onTransitionEnd={() => {
            if (caption.isExiting) {
              setCaptions((captions) => captions.filter((c) => c !== caption));
            }
          }}
        >
          {caption.text}
        </div>
      ))}
    </div>
  );
}

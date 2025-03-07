import {
  type StreamVideoParticipant,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

export function useAgentParticipant(): StreamVideoParticipant | null {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  // const agent = participants.find((p) => p.custom?.fields.agent) ?? null;
  const agent = participants.find((p) => p.userId === "lucy") ?? null;
  return agent;
}

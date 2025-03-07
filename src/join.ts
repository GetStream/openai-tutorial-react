import { Call, StreamVideoClient } from "@stream-io/video-react-sdk";

interface CallCredentials {
  apiKey: string;
  token: string;
  userId: string;
  cid: string;
}

const baseUrl = "http://localhost:3000";

export async function fetchCallCredentials() {
  const res = await fetch(`${baseUrl}/credentials`);

  if (res.status !== 200) {
    throw new Error("Could not fetch call credentials");
  }

  const creds = await res.json();
  return {
    apiKey: creds.apiKey,
    token: creds.token,
    userId: parseUserIdFromToken(creds.token),
    cid: creds.cid,
  };
}

export async function joinCall(
  credentials: CallCredentials
): Promise<[client: StreamVideoClient, call: Call]> {
  const client = new StreamVideoClient({
    apiKey: credentials.apiKey,
    user: { id: credentials.userId },
    token: credentials.token,
  });
  const [callType, callId] = credentials.cid.split(":");
  const call = client.call(callType, callId);
  call.updateClosedCaptionSettings({
    maxVisibleCaptions: 0,
    visibilityDurationMs: 0,
  });

  try {
    await Promise.all([connectAgent(call), call.join({ create: true })]);
  } catch (err) {
    call.leave();
    client.disconnectUser();
    throw err;
  }

  return [client, call];
}

async function connectAgent(call: Call) {
  const res = await fetch(`${baseUrl}/${call.cid}/connect`, {
    method: "POST",
  });

  if (res.status !== 200) {
    throw new Error("Could not connect agent");
  }
}

function parseUserIdFromToken(token: string) {
  const payload = token.split(".")[1];
  if (!payload) return "";
  return JSON.parse(atob(payload)).user_id ?? "";
}

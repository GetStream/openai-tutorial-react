import { Call, StreamVideoClient } from "@stream-io/video-react-sdk";

interface CallCredentials {
  apiKey: string;
  token: string;
  callType: string;
  callId: string;
  userId: string;
}

const baseUrl = "http://localhost:3000";

export async function fetchCallCredentials(): Promise<CallCredentials> {
  const res = await fetch(`${baseUrl}/credentials`);

  if (res.status !== 200) {
    throw new Error("Could not fetch call credentials");
  }

  return (await res.json()) as CallCredentials;
}

export async function joinCall(
  credentials: CallCredentials
): Promise<[client: StreamVideoClient, call: Call]> {
  const client = new StreamVideoClient({
    apiKey: credentials.apiKey,
    user: { id: credentials.userId },
    token: credentials.token,
  });
  const call = client.call(credentials.callType, credentials.callId);
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
  const res = await fetch(`${baseUrl}/${call.type}/${call.id}/connect`, {
    method: "POST",
  });

  if (res.status !== 200) {
    throw new Error("Could not connect agent");
  }
}

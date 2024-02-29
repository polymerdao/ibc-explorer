import { GetTmClient } from "api/utils/cosmos";
import { QueryChannelsResponse } from "cosmjs-types/ibc/core/channel/v1/query";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic' // defaults to auto
export type { IdentifiedChannel } from "cosmjs-types/ibc/core/channel/v1/channel";

export async function GET() {
  const tmClient = await GetTmClient(process.env.API_URL!);
  const channels = await tmClient.ibc.channel.allChannels();
  return NextResponse.json((QueryChannelsResponse.toJSON(channels) as QueryChannelsResponse).channels);
}

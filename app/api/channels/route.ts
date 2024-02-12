import { QueryChannelsResponse } from "cosmjs-types/ibc/core/channel/v1/query";
import { getTmClient } from "@/api/utils/cosmos";

export const dynamic = 'force-dynamic' // defaults to auto

export async function GET() {
  const tmClient = await getTmClient(process.env.API_URL!)
  const channels = await tmClient.ibc.channel.allChannels()
  return (QueryChannelsResponse.toJSON(channels) as QueryChannelsResponse).channels
}

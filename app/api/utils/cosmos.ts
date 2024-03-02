import { IbcExtension, QueryClient, setupIbcExtension } from "@cosmjs/stargate";
import { Tendermint37Client } from "@cosmjs/tendermint-rpc";

export async function GetTmClient(): Promise<QueryClient & IbcExtension> {
  const tmClient = await Tendermint37Client.connect(process.env.API_URL!);
  return QueryClient.withExtensions(tmClient, setupIbcExtension);
}

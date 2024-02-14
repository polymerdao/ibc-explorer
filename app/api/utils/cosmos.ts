import { IbcExtension, QueryClient, setupIbcExtension } from "@cosmjs/stargate";
import { Tendermint37Client } from "@cosmjs/tendermint-rpc";

export async function GetTmClient(rpc: string): Promise<QueryClient & IbcExtension> {
  const tmClient = await Tendermint37Client.connect(rpc);
  return QueryClient.withExtensions(tmClient, setupIbcExtension);
}

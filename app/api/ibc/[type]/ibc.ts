import { execSync } from "child_process";
import { ChannelsPaginated, ClientStatesPaginated, ConnectionsPaginated } from "../../../schemas";

export async function getConnections(apiUrl: string) {
  const cliOutput = execSync(
    `polymerd query ibc connection connections --output json --node ${apiUrl}`,
    {timeout: 10 * 1000}
  );
  const parsedData = ConnectionsPaginated.parse(JSON.parse(cliOutput.toString()));
  return parsedData.connections
}

export async function getClients(apiUrl: string) {
  const cliOutput = execSync(
    `polymerd query ibc client states --output json --node ${apiUrl}`,
    {timeout: 20 * 1000}
  );
  const parsedData = ClientStatesPaginated.parse(JSON.parse(cliOutput.toString()));
  return parsedData.client_states
}

export async function getChannels(apiUrl: string) {
  const cliOutput = execSync(
    `polymerd query ibc channel channels --output json --node ${apiUrl}`,
    {timeout: 10 * 1000}
  );
  const parsedData = ChannelsPaginated.parse(JSON.parse(cliOutput.toString()));
  return parsedData.channels
}
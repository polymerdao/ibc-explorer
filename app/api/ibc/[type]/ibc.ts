import { execSync } from "child_process";
import { ChannelsPaginated, ClientStatesPaginated, ConnectionsPaginated } from "../../../schemas";

export async function getConnections(apiUrl: string) {
  try {
    const cliOutput = execSync(
      `polymerd query ibc connection connections --output json --node ${apiUrl}`
    );
    const parsedData = ConnectionsPaginated.parse(JSON.parse(cliOutput.toString()));
    return parsedData.connections
  } catch (e) {
    return []
  }
}

export async function getClients(apiUrl: string) {
  try {
    const cliOutput = execSync(
      `polymerd query ibc client states --output json --node ${apiUrl}`
    );
    const parsedData = ClientStatesPaginated.parse(JSON.parse(cliOutput.toString()));
    return parsedData.client_states
  } catch (e) {
    return []
  }
}

export async function getChannels(apiUrl: string) {
  try {
    const cliOutput = execSync(
      `polymerd query ibc channel channels --output json --node ${apiUrl}`
    );
    const parsedData = ChannelsPaginated.parse(JSON.parse(cliOutput.toString()));
    return parsedData.channels
  } catch (e) {
    return []
  }
}
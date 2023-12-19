import { Card, Title, Text } from '@tremor/react';
import ClientsTable from './clients-table';
import { execSync } from "child_process";
import { ChannelsPaginated, ClientStatesPaginated, ConnectionsPaginated } from "./schemas";
import ConnectionsTable from "./connections-table";
import React from "react";
import ChannelsTable from "./channels-table";
import { unstable_noStore as noStore } from 'next/cache';



interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

async function getConnections(apiUrl: string) {
  'use server'

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

async function getClients(apiUrl: string) {
  'use server'

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

async function getChannels(apiUrl: string) {
  'use server'

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

export default async function IndexPage({
                                          searchParams
                                        }: {
  searchParams: { q: string };
}) {
  noStore();

  let apiUrl = process.env.API_URL!;
  console.log("API URL: ", apiUrl)
  const clients = await getClients(apiUrl)
  const connections = await getConnections(apiUrl)
  const channels = await getChannels(apiUrl)

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Title>Clients</Title>
      <Text>A list of virtual clients</Text>
      {/*<Search />*/}
      <Card className="mt-6">
        <ClientsTable clients={clients}/>
      </Card>
      <br/>
      <Title>Connections</Title>
      <Text>A list of virtual connections</Text>
      <Card className="mt-6">
        <ConnectionsTable connections={connections}/>
      </Card>
      <br/>
      <Title>Channels</Title>
      <Text>A list of virtual channels</Text>
      <Card className="mt-6">
        <ChannelsTable channels={channels}/>
      </Card>
    </main>
  );
}

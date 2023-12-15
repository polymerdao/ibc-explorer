import { Card, Title, Text } from '@tremor/react';
import Search from './search';
import ClientsTable from './clients-table';
import { execSync } from "child_process";
import { ChannelsPaginated, ClientStatesPaginated, ConnectionsPaginated } from "./schemas";
import ConnectionsTable from "./connections-table";
import React from "react";
import ChannelsTable from "./channels-table";


interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

async function getConnections(apiUrl: string) {
  'use server'

  const cliOutput = execSync(
    `polymerd query ibc connection connections --output json --node ${apiUrl}`
  );
  const parsedData = ConnectionsPaginated.parse(JSON.parse(cliOutput.toString()));
  return parsedData.connections
}

async function getClients(apiUrl: string) {
  'use server'

  const cliOutput = execSync(
    `polymerd query ibc client states --output json --node ${apiUrl}`
  );
  const parsedData = ClientStatesPaginated.parse(JSON.parse(cliOutput.toString()));
  return parsedData.client_states
}

async function getChannels(apiUrl: string) {
  'use server'

  const cliOutput = execSync(
    `polymerd query ibc channel channels --output json --node ${apiUrl}`
  );
  const parsedData = ChannelsPaginated.parse(JSON.parse(cliOutput.toString()));
  return parsedData.channels
}

export default async function IndexPage({
                                          searchParams
                                        }: {
  searchParams: { q: string };
}) {
  let apiUrl = "tcp://localhost:26657";
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

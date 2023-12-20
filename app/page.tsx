import { Card, Text, Title } from '@tremor/react';
import ClientsTable from './clients-table';
import ConnectionsTable from "./connections-table";
import React from "react";
import ChannelsTable from "./channels-table";
import { unstable_noStore as noStore } from 'next/cache';
import { getChannels, getClients, getConnections } from "./api/ibc/[type]/ibc";

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

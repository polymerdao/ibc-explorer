// ChannelsTable.tsx
import React from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Text,
} from '@tremor/react';
import { ChannelsSchema } from "./schemas";

export default function ChannelsTable({ channels }: { channels: ChannelsSchema }) {

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Channel ID</TableHeaderCell>
          <TableHeaderCell>State</TableHeaderCell>
          <TableHeaderCell>Counterparty Channel ID</TableHeaderCell>
          <TableHeaderCell>Counterparty Port ID</TableHeaderCell>
          <TableHeaderCell>Connection Hops</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {channels.map((channel) => (
          <TableRow key={channel.channel_id}>
            <TableCell>{channel.channel_id}</TableCell>
            <TableCell>{channel.state}</TableCell>
            <TableCell>{channel.counterparty.channel_id}</TableCell>
            <TableCell>{channel.counterparty.port_id}</TableCell>
            <TableCell>{channel.connection_hops.join(', ')}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
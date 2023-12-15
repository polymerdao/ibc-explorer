import {
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
} from '@tremor/react';
import { ConnectionsSchema } from "./schemas";

export default function ConnectionsTable({ connections }: { connections: ConnectionsSchema }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Connection ID</TableHeaderCell>
          <TableHeaderCell>Client ID</TableHeaderCell>
          <TableHeaderCell>State</TableHeaderCell>
          <TableHeaderCell>Counterparty</TableHeaderCell>
          <TableHeaderCell>Delay Period</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {connections.map((connection) => (
          <TableRow key={connection.id}>
            <TableCell>{connection.id}</TableCell>
            <TableCell>{connection.client_id}</TableCell>
            <TableCell>{connection.state}</TableCell>
            <TableCell>{`${connection.counterparty.client_id} - ${connection.counterparty.connection_id}`}</TableCell>
            <TableCell>{connection.delay_period}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

import {
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Text
} from '@tremor/react';
import { ClientStatesSchema } from "./schemas";

export default function ClientsTable({ clients }: { clients: ClientStatesSchema }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeaderCell>Client ID</TableHeaderCell>
          <TableHeaderCell>Revision Height</TableHeaderCell>
          <TableHeaderCell>Revision Number</TableHeaderCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {clients.map((clientState) => (
          <TableRow key={clientState.client_id}>
            <TableCell>{clientState.client_id}</TableCell>
            <TableCell>
              <Text>{clientState.client_state.latest_height.revision_height}</Text>
            </TableCell>
            <TableCell>
              <Text>{clientState.client_state.latest_height.revision_number}</Text>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

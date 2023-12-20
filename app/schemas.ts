import { z } from 'zod';

const Height = z.object({
  revision_number: z.string(),
  revision_height: z.string(),
});

const ClientState = z.object({
  '@type': z.string(),
  chain_id: z.string().optional(),
  latest_height: Height,
  params: z.string().optional(),
});

const Client = z.object({
  client_id: z.string(),
  client_state: ClientState,
});

const ClientStates = z.array(
  Client
);

const Pagination = z.object({
  next_key: z.nullable(z.unknown()),
  total: z.string(),
});

export const ClientStatesPaginated = z.object({
  client_states: ClientStates,
  pagination: Pagination,
});


const Prefix = z.object({
  key_prefix: z.string(),
});

const Counterparty = z.object({
  client_id: z.string(),
  connection_id: z.string(),
  prefix: Prefix,
});

const Version = z.object({
  identifier: z.string(),
  features: z.array(z.string()),
});

const Connection = z.object({
  id: z.string(),
  client_id: z.string(),
  versions: z.array(Version),
  state: z.string(),
  counterparty: Counterparty,
  delay_period: z.string(),
});

const Connections = z.array(Connection);

export const ConnectionsPaginated = z.object({
  connections: Connections,
  pagination: Pagination,
  height: Height,
});


const Channel = z.object({
  state: z.string(),
  ordering: z.string(),
  counterparty: z.object({
    port_id: z.string(),
    channel_id: z.string(),
  }),
  connection_hops: z.array(z.string()),
  version: z.string(),
  port_id: z.string(),
  channel_id: z.string(),
});

const Channels = z.array(Channel);

export const ChannelsPaginated = z.object({
  channels: Channels,
  pagination: Pagination,
  height: Height,
});


export type ClientStatesSchema = z.infer<typeof ClientStates>
export type ConnectionsSchema = z.infer<typeof Connections>
export type ChannelsSchema = z.infer<typeof Channels>
export type ChannelSchema = z.infer<typeof Channel>
export type ConnectionSchema = z.infer<typeof Connection>
export type ClientSchema = z.infer<typeof Client>



'use client';

import { Col, Select, SelectItem } from "@tremor/react";
import { useState } from "react";
import { Grid } from "@tremor/react";
import { IbcComponent } from "../ibc";
import { PacketData } from "../api/ibc/[type]/packets";
import { CHAIN_CONFIGS } from "../chains";

const columns = [
  {name: "ID", uid: "id", sortable: true},
  {name: "State", uid: "state", sortable: true},
  {name: "Send Tx", uid: "sendTx", sortable: false},
  {name: "Rcv Tx", uid: "rcvTx", sortable: false},
  {name: "Ack Tx", uid: "ackTx", sortable: false},
  {name: "Src Port Address", uid: "sourcePortAddress", sortable: false},
  {name: "Src Channel Id", uid: "sourceChannelId", sortable: true},
  {name: "Seq", uid: "sequence", sortable: true},
  {name: "Create Time", uid: "createTime", sortable: true},
  {name: "End Time", uid: "endTime", sortable: true},
];

export default function Packets() {
  const [chainFrom, setChainFrom] = useState("");
  const [chainTo, setChainTo] = useState("");
  const [chainToDisabled, setChainToDisabled] = useState(true);

  async function chainFromChange(val: string) {
    setChainFrom(val)
    setChainToDisabled(false)
  }

  async function chainToChange(val: string) {
    setChainTo(val)
  }

  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <div className="max-w-sm mx-auto space-y-6">
        <Grid numItems={2} numItemsSm={2} numItemsLg={2} className="gap-2">
          <Col>
            <div className="text-slate-500 text-sm text-center font-mono">Chain From</div>
            <Select value={chainFrom} onValueChange={chainFromChange} enableClear={false}>
              {
                Object.entries(CHAIN_CONFIGS).map(([key, value]) => {
                  return (
                    <SelectItem value={key} icon={value.icon}>
                      {value.display}
                    </SelectItem>
                  )
                }, {})
              }
            </Select>
          </Col>
          <Col>
            <div className="text-slate-500 text-sm text-center font-mono">Chain To</div>
            <Select value={chainTo} onValueChange={chainToChange} disabled={chainToDisabled}>
              {
                Object.entries(CHAIN_CONFIGS).map(([key, value]) => {
                  return (
                    <SelectItem value={key} icon={value.icon}>
                      {value.display}
                    </SelectItem>
                  )
                }, {})
              }
            </Select>
          </Col>
        </Grid>
      </div>
      {chainFrom && chainTo &&
      <IbcComponent<PacketData>
        initialVisibleColumns={new Set(["state", "sourcePortAddress", "sourceChannelId", "sequence", "createTime", "endTime", "sendTx", "rcvTx", "ackTx"])}
        columns={columns}
        statusOptions={[]}
        defaultSortDescriptor={{
          column: "createTime",
          direction: "descending",
        }}
        ibcEntityName="packet"
        keyProperty="id"
        queryParams={
          new URLSearchParams({
            chainFrom: chainFrom,
            chainTo: chainTo,
            from: "1",
          })}
      />
      }
    </main>
  );
}
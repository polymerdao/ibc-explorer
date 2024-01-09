'use client';

import { Card, Col, Metric, Select, SelectItem, Text } from "@tremor/react";
import { useState } from "react";
import OptimismIcon from "./optimismIcon";
import BaseIcon from "./baseIcon";
import { Grid } from "@tremor/react";


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
              <SelectItem value="optimism" icon={OptimismIcon}>
                Optimism
              </SelectItem>
              <SelectItem value="base" icon={BaseIcon}>
                Base
              </SelectItem>
            </Select>
          </Col>
          <Col>
            <div className="text-slate-500 text-sm text-center font-mono">Chain To</div>
            <Select value={chainTo} onValueChange={chainToChange} disabled={chainToDisabled}>
              <SelectItem value="optimism" icon={OptimismIcon}>
                Optimism
              </SelectItem>
              <SelectItem value="base" icon={BaseIcon}>
                Base
              </SelectItem>
            </Select>
          </Col>
        </Grid>
      </div>
    </main>
  );


}
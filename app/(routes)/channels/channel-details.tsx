import { useEffect } from 'react';
import { IdentifiedChannel, stateToString } from 'utils/types/channel';

export function ChannelDetails(channel: IdentifiedChannel | null) {
  return !channel ? (
    <>
      <h2 className="mt-1 mb-2 mr-8">No Results</h2>
      <p>Channel not found</p>
    </>
  ) : (
    <div className="pl-8 pr-6 pt-2 pb-5 min-w-[870px]">
      <h1>Channel Details</h1>
      <div className="flex flex-col gap-2 mt-7">
        <div className="flex flex-row justify-between">
          <p className="mr-8 font-medium">Channel ID</p>
          <p className="font-mono text-[17px]/[24px]">{ channel.channelId }</p>
        </div>
        <Divider />
        <div className="flex flex-row justify-between">
          <p className="mr-8 font-medium">State</p>
          <p className="font-mono text-[17px]/[24px]">{ stateToString(channel.state) }</p>
        </div>
        <Divider />
        <div className="flex flex-row justify-between">
          <p className="mr-8 font-medium">Counterparty Channel ID</p>
          <p className="font-mono text-[17px]/[24px]">{ channel.counterparty.channelId }</p>
        </div>
        <Divider />
        <div className="flex flex-row justify-between">
          <p className="mr-8 font-medium">Port ID</p>
          <p className="font-mono text-[17px]/[24px]">{ channel.portId }</p>
        </div>
        <Divider />
        <div className="flex flex-row justify-between">
          <p className="mr-8 font-medium">Counterparty Port ID</p>
          <p className="font-mono text-[17px]/[24px]">{ channel.counterparty.portId }</p>
        </div>
        <Divider />
        <div className="flex flex-row justify-between">
          <p className="mr-8 font-medium">Connection Hops</p>
          <p className="font-mono text-[17px]/[24px]">{ channel.connectionHops[0] }, { channel.connectionHops[1] }</p>
        </div>
      </div>
    </div>
  );
}

function Divider () {
  return (
    <div className="flex flex-row justify-center my-0.5">
      <div className="h-0 mb-[0.5px] mt-[1.5px] w-[calc(100%-0.5rem)] border-b border-gray-500"></div>
    </div>
  );
}

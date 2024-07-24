import Link from 'next/link';
import { Packet, PacketStates, stateToString } from 'utils/types/packet';
import { CHAIN_CONFIGS, CHAIN, clientToDisplay } from 'utils/chains/configs';
import { classNames } from 'utils/functions';
import { CopyButton } from 'components/copy-button';

export function PacketDetails(packet: Packet | null) {
  let sourceUrl = '';
  let destUrl = '';

  for (const chain of Object.keys(CHAIN_CONFIGS)) {
    const chainName = chain as CHAIN;
    const chainVals = CHAIN_CONFIGS[chainName];
    if (packet?.sourceClient?.toLowerCase().startsWith(chain)) {
      sourceUrl = chainVals.txUrl;
    }
    if (packet?.destClient?.toLowerCase().startsWith(chain)) {
      destUrl = chainVals.txUrl;
    }
  }

  return !packet ? (
    <>
      <h2 className="mt-1 mb-2 mr-8">No Results</h2>
      <p>Packet not found</p>
    </>
  ) : (

    <div className="pl-8 pr-6 pt-2 pb-5 min-w-[870px]">
      <h1>Packet Details</h1>

      {/* Status Bar */}
      <div className="w-full h-20 flex flex-row mt-6 mb-9">
        <div className="w-60 h-full grid justify-items-center content-center bg-sky-600/50 font-mono font-medium text-lg">
          <p>Src Chain:</p>
          <p>{clientToDisplay(packet.sourceClient)}</p>
        </div>

        {/* Middle Section */}
        <div className="relative grow flex flex-col justify-between">
          <div className="absolute w-full h-full grid content-between pt-1.5 pb-[0.425rem] font-mono text-[1rem]">
            <div>
              {packet.state >= PacketStates.RECV &&
                <p className="w-full grid justify-items-center">
                  relayed{packet.recvTime ? ` - ${formatDuration(packet.recvTime - packet.createTime)}` : ''}
                </p>}
              {packet.state < PacketStates.RECV &&
                <p className="w-full grid justify-items-center animate-pulse">relaying</p>}
            </div>
            <div>
              {packet.state >= PacketStates.ACK &&
                <p className="w-full grid justify-items-center">
                  confirmed{(packet.recvTime && packet.endTime) ? ` - ${formatDuration(packet.endTime - packet.recvTime)}` : ''}
                </p>}
              {(PacketStates.ACK > packet.state && packet.state >= PacketStates.RECV) &&
                <p className="w-full grid justify-items-center animate-pulse">confirming</p>}
              {packet.state < PacketStates.RECV &&
                <p className="w-full grid justify-items-center"> </p>}
            </div>
          </div>

          {/* Top Arrrow */}
          <div className={classNames(
            packet.state < PacketStates.RECV
            ? 'animate-pulse'
            : ''
            , 'relative flex flex-row justify-center items-start w-full pl-[3.75rem] pr-[2.3rem]'
          )}>
            <div className="absolute h-[7px] w-[7px] rounded-full bg-white left-[58px] -top-[2.8px]"></div>
            <div className="absolute right-[37.4px] bottom-[18.5px]">
              <div className="w-1 h-[2px] skew-y-[30deg] ml-[5px] bg-white"></div>
              <div className="w-[10px] h-[1px] border-[1px] border-white rounded rotate-[75deg] origin-right -mb-[2.7px]"></div>
              <div className="w-[10px] h-[1px] border-[1px] border-white rounded -rotate-[15deg] origin-right -mr-[1px]"></div>
            </div>
            <div className="grow flex justify-end pr-1 items-center h-10 border-t-[1.5px] border-white font-mono text-lg">
            </div>
            <div className="h-10 w-2 border-r-[2px] border-t-[3.5px] border-white rounded-tr-lg skew-y-[60deg] origin-bottom-right -rotate-[60deg] -mt-[20.2px] ml-[40px]">
            </div>
          </div>

          {/* Bottom Arrrow */}
          <div className={classNames(
            packet.state < PacketStates.ACK
            ? packet.state < PacketStates.RECV ? 'opacity-50' : 'animate-pulse'
            : ''
            , 'relative flex flex-row justify-center items-end w-full h-fit pl-[2.3rem] pr-[3.75rem]'
          )}>
            <div className="absolute h-[7px] w-[7px] rounded-full bg-white right-[58px] -bottom-[2.5px]"></div>
            <div className="absolute left-[37.8px] top-[18.8px]">
              <div className="w-1 h-[2px] skew-y-[30deg] mr-[6px] bg-white ml-[1px] mt-[1.5px]"></div>
              <div className="w-[10px] h-[2px] border-[1.2px] border-white rounded -rotate-[15deg] origin-left -mt-[3.1px]"></div>
              <div className="w-[10px] h-[2px] border-[1.2px] border-white rounded rotate-[75deg] origin-left -mt-[2.5px]"></div>
            </div>
            <div className="h-10 w-2 border-l-[2px] border-b-[3.5px] border-white rounded-bl-lg skew-y-[60deg] origin-top-left -rotate-[60deg] -mb-[20.2px] mr-[40px]">
            </div>
            <div className="grow flex justify-start pl-1 items-center h-10 border-b-[1.5px] border-white font-mono text-lg">
            </div>
          </div>
        </div>

        <div className="w-60 h-full grid justify-items-center content-center bg-sky-600/50 font-mono font-medium text-lg">
          <p>Dest Chain:</p>
          <p>{clientToDisplay(packet.destClient)}</p>
        </div>
      </div>

      {/* Details Section */}
      <div className="flex flex-col gap-2 mt-4">

        {/* Status */}
        <div className="flex flex-row justify-between">
          <p className="mr-8 font-semibold">Status</p>
          <p className="font-mono text-[17px]/[24px]">{stateToString(packet.state)}</p>
        </div>
        <Divider />

        {/* Date */}
        <div className="flex flex-row justify-between">
          <p className="mr-8 font-semibold">Time Created</p>
          <p className="font-mono text-[17px]/[24px]">{new Date(packet.createTime*1000).toLocaleString()}</p>
        </div>
        <Divider />

        {/* Links */}
        <div className="flex flex-row justify-between">
          <p className="mr-8 font-semibold">Source Port Address</p>
          {linkAndCopy(sourceUrl, 'address', packet.sourcePortAddress)}
        </div>
        <Divider />
        <div className="flex flex-row justify-between">
          <p className="mr-8 font-semibold">Dest Port Address</p>
          {linkAndCopy(destUrl, 'address', packet.destPortAddress)}
        </div>
        <Divider />
        <div className="flex flex-row justify-between">
          <p className="mr-8 font-semibold">Send Tx</p>
          {linkAndCopy(sourceUrl, 'tx', packet.sendTx)}
        </div>
        <Divider />
        <div className="flex flex-row justify-between">
          <p className="mr-8 font-semibold">Rcv Tx</p>
          {linkAndCopy(destUrl, 'tx', packet.rcvTx)}
        </div>
        <Divider />
        <div className="flex flex-row justify-between">
          <p className="mr-8 font-semibold">Ack Tx</p>
          {linkAndCopy(sourceUrl, 'tx', packet.ackTx)}
        </div>

      </div>
    </div>
  );
}

function Divider () {
  return (
    <div className="flex flex-row justify-center my-0.5">
      <div className="h-0 mb-[0.5px] mt-[1.5px] w-[calc(100%-0.5rem)] border-b border-white/30"></div>
    </div>
  );
}

function linkAndCopy(url: string, path: string, hex?: string) {
  if (!hex) {
    return <p className="font-mono animate-pulse">...</p>;
  }

  hex = hex.toLowerCase();
  if (hex[0] != '0' || hex[1] != 'x') {
    let split = hex.split('.');
    if (split.length > 0) {
      hex = split.pop();
    }
    hex = '0x' + hex;
  }

  return (
    <div className="whitespace-nowrap flex flex-row">
      <Link href={url + path + '/' + hex} target="_blank"
        className="text-sky-600 dark:text-sky-400 font-mono text-[17px]/[24px] hover:underline underline-offset-2">
        {hex}
      </Link>
      <CopyButton str={hex} />
    </div>
  );
}

function formatDuration(duration: number) {
  if (duration < 180) {
    return `${duration}s`;
  }
  if (duration < 3600) {
    return `${Math.floor(duration / 60)}m`;
  }
  return `${(duration / 3600).toFixed(1)}h`;
}

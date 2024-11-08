import { Packet, PacketStates, stateToString } from 'utils/types/packet';
import { CHAIN_CONFIGS, CHAIN, clientToDisplay } from 'utils/chains/configs';
import { classNames, numberWithCommas, getExplorerFromRegistry } from 'utils/functions';
import { LinkAndCopy } from 'components/link-and-copy';
import { useEffect, useState } from 'react';

export function PacketDetails(initialPacket: Packet | null) {
  const [packet, setPacket] = useState<Packet | null>(initialPacket);
  const [sourceChainName, setSourceChainName] = useState<CHAIN | ''>('');
  const [destChainName, setDestChainName] = useState<CHAIN | ''>('');
  const [sourceChainExplorer, setSourceChainExplorer] = useState<string>('');
  const [destChainExplorer, setDestChainExplorer] = useState<string>('');
  const [recvFunding, setRecvFunding] = useState<number>(0);
  const [ackFunding, setAckFunding] = useState<number>(0);

  useEffect(() => {
    for (const chain of Object.keys(CHAIN_CONFIGS)) {
      const chainName = chain as CHAIN;
      if (packet?.sourceClient?.toLowerCase().startsWith(chain)) {
        setSourceChainName(chainName);
      }
      if (packet?.destClient?.toLowerCase().startsWith(chain)) {
        setDestChainName(chainName);
      }
    }
  }, [packet]);


  // TODO:
  // - Do something else with console.log
  // - Stop requests when modal is closed
  useEffect(() => {
    setPacket(initialPacket);
    if (!packet) {
      return;
    }

    const controller = new AbortController();
    const intervalId = setInterval(() => {
      fetch(
        `/api/packets?searchValue=${packet!.id}`,
        {
          cache: 'no-store',
          signal: controller.signal
        }
      ).then(res => {
        if (!res.ok) {
          console.log('Failed to fetch packets');
        }
        return res.json();
      }).then(data => {
        if (data.packets.length > 0) {
          setPacket(data.packets[0]);
        } else {
          console.log('No packets');
        }
      }).catch((err) => {
        console.log('Failed to fetch packets', err);
      });
    }, 5000);

    return () => clearInterval(intervalId);
  }, [initialPacket]);

  useEffect(() => {
    async function fetchVars() {
      if (packet && sourceChainName && destChainName) {
        const recv = await calcTxFunding(sourceChainName, packet.totalRecvFeesDeposited, packet.recvGasLimit);
        const ack = await calcTxFunding(destChainName, packet.totalAckFeesDeposited, packet.ackGasLimit);
        const sourceExplorer = await getExplorerFromRegistry(sourceChainName);
        const destExplorer = await getExplorerFromRegistry(destChainName);
        setRecvFunding(recv);
        setAckFunding(ack);
        setSourceChainExplorer(sourceExplorer);
        setDestChainExplorer(destExplorer);
      }
    }
    fetchVars();
  }, [packet, sourceChainName, destChainName]);

  return !packet ? (
    <>
      <h2 className="mt-1 mb-2 mr-8">No Results</h2>
      <p>Packet not found</p>
    </>
  ) : (

    <div className="pl-8 pr-6 pt-2 pb-5 min-w-[870px]" data-testid="packet-details">
      <h1>Packet Details</h1>

      {/* Status Bar */}
      <div className="w-full h-24 flex flex-row mt-6 mb-9">
        <div className="w-60 h-full grid justify-items-center content-center rounded-sm bg-vapor text-black font-mono font-medium text-lg">
          <p>Src Chain:</p>
          <p>{clientToDisplay(packet.sourceClient)}</p>
        </div>

        {/* Middle Section */}
        <div className="relative grow flex flex-col justify-between">
          <div className="absolute w-full h-full grid content-between pt-2 pb-2 font-mono text-[1rem]">
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
            , 'relative flex flex-row justify-center items-start w-full pl-[3.75rem] pr-[2.3rem] pt-0.5'
          )}>
            <div className="absolute h-[7px] w-[7px] rounded-full bg-white left-[58px] -top-[0.8px]"></div>
            <div className="absolute right-[37.4px] bottom-[18.5px]">
              <div className="w-1 h-[2px] skew-y-[30deg] ml-[5px] bg-white"></div>
              <div className="w-[10px] h-[1px] border-[1px] border-white rounded rotate-[75deg] origin-right -mb-[2.7px]"></div>
              <div className="w-[10px] h-[1px] border-[1px] border-white rounded -rotate-[15deg] origin-right -mr-[1px]"></div>
            </div>
            <div className="grow flex justify-end pr-1 items-center h-10 border-t-[1.5px] border-white font-mono text-lg">
            </div>
            <div className="h-10 w-2 border-r-[2px] border-t-[3.5px] border-white rounded-tr-lg skew-y-[60deg] origin-bottom-right -rotate-[60deg] -mt-[20px] ml-[40px]">
            </div>
          </div>

          {/* Bottom Arrrow */}
          <div className={classNames(
            packet.state < PacketStates.ACK
            ? packet.state < PacketStates.RECV ? 'opacity-50' : 'animate-pulse'
            : ''
            , 'relative flex flex-row justify-center items-end w-full h-fit pl-[2.3rem] pr-[3.75rem] pb-0.5'
          )}>
            <div className="absolute h-[7px] w-[7px] rounded-full bg-white right-[58px] -bottom-[1px]"></div>
            <div className="absolute left-[37.8px] top-[18.8px]">
              <div className="w-1 h-[2px] skew-y-[30deg] mr-[6px] bg-white ml-[1px] mt-[1.5px]"></div>
              <div className="w-[10px] h-[2px] border-[1.2px] border-white rounded -rotate-[15deg] origin-left -mt-[3.1px]"></div>
              <div className="w-[10px] h-[2px] border-[1.2px] border-white rounded rotate-[75deg] origin-left -mt-[2.5px]"></div>
            </div>
            <div className="h-10 w-2 border-l-[2px] border-b-[3.5px] border-tuquoise rounded-bl-lg skew-y-[60deg] origin-top-left -rotate-[60deg] -mb-[20.2px] mr-[40px]">
            </div>
            <div className="grow flex justify-start pl-1 items-center h-10 border-b-[1.5px] border-white font-mono text-lg">
            </div>
          </div>
        </div>

        <div className="w-60 h-full grid justify-items-center content-center rounded-sm bg-vapor/90 text-black font-mono font-medium text-lg">
          <p>Dest Chain:</p>
          <p>{clientToDisplay(packet.destClient)}</p>
        </div>
      </div>

      {/* Details Section */}
      <div className="flex flex-col gap-2 mt-4">

        {/* Status */}
        <div className="flex flex-row justify-between">
          <p className="mr-8 font-medium">Status</p>
          <p className="font-mono text-[17px]/[24px]">{stateToString(packet.state)}</p>
        </div>
        <Divider />

        {/* Date */}
        <div className="flex flex-row justify-between">
          <p className="mr-8 font-medium">Time Created</p>
          <p className="font-mono text-[17px]/[24px]">{new Date(packet.createTime*1000).toLocaleString()}</p>
        </div>
        <Divider />

        {/* Links */}
        <div className="flex flex-row justify-between">
          <p className="mr-8 font-medium">Source Port Address</p>
          <LinkAndCopy url={sourceChainExplorer} path="address" hex={packet.sourcePortAddress} />
        </div>
        <Divider />
        <div className="flex flex-row justify-between">
          <p className="mr-8 font-medium">Dest Port Address</p>
          <LinkAndCopy url={destChainExplorer} path="address" hex={packet.destPortAddress} />
        </div>
        <Divider />
        <div className="flex flex-row justify-between" data-testid="send-tx">
          <p className="mr-8 font-medium">Send Tx</p>
          <LinkAndCopy url={sourceChainExplorer} path="tx" hex={packet.sendTx} />
        </div>
        <Divider />
        <div className="flex flex-row justify-between" data-testid="recv-tx">
          <p className="mr-8 font-medium">Rcv Tx</p>
          {txWithFeeInfo(recvFunding, destChainExplorer, packet.rcvTx)}
        </div>
        <Divider />
        <div className="flex flex-row justify-between" data-testid="ack-tx">
          <p className="mr-8 font-medium">Ack Tx</p>
          {txWithFeeInfo(ackFunding, sourceChainExplorer, packet.ackTx)}
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

function formatDuration(duration: number) {
  if (duration < 180) {
    return `${duration}s`;
  }
  if (duration < 3600) {
    return `${Math.floor(duration / 60)}m`;
  }
  return `${(duration / 3600).toFixed(1)}h`;
}

function txWithFeeInfo(fundingStatus: number, url: string, txHash?: string) {
  if (txHash) {
    return <LinkAndCopy url={url} path="tx" hex={txHash} />;
  }
  else if (fundingStatus > 0) {
    return <p className="font-mono text-warning">~{numberWithCommas(Math.round(fundingStatus / 1000000000))} Gwei Underfunded</p>;
  }
  else {
    return <p className="font-mono animate-pulse">...</p>;
  }
}

async function calcTxFunding(chainName: string, feesDeposited?: number, gasLimit?: number) {
  if (!feesDeposited || !gasLimit) {
    return 0;
  }

  const feeResponse = await fetch(`/api/rpc-data?chain=${chainName}`,
    { cache: 'no-store' });
  if (!feeResponse.ok) { return 0; }
  const feeData = await feeResponse.json();
  if (feeData.error) { return 0; }

  const gasPrice = Number(feeData.gasPrice);
  if (isNaN(gasPrice)) { return 0; }

  feesDeposited = Number(feesDeposited);
  gasLimit = Number(gasLimit);

  if (feesDeposited < (gasLimit * gasPrice)) {
    return (gasLimit * gasPrice) - feesDeposited;
  } else {
    return 0;
  }
}

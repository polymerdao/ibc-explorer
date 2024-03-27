import { Packet } from 'utils/types/packet';
import Link from 'next/link';
import { FiExternalLink } from "react-icons/fi";

const optimismUrl = "https://optimism-sepolia.blockscout.com/tx/";
const baseUrl = "https://base-sepolia.blockscout.com/tx/";

export function PacketDetails(packet: Packet) {
  let sourceUrl = "";
  let destUrl = "";
  if (packet?.sourceChain?.startsWith("optimism")) {
    sourceUrl = optimismUrl;
    destUrl = baseUrl;
  } else {
    sourceUrl = baseUrl;
    destUrl = optimismUrl;
  }

  return (packet &&
    <>
    {!packet.sendTx && 
      <h3 className="mt-1 mr-8">Packet not found</h3>
    }
    {packet.sendTx &&
      <>
        <h1>Packet Details</h1>
        <div className="flex flex-col gap-2 mt-4">

          <div className="flex flex-row justify-between">
            <p className="mr-8 font-semibold">Source Chain</p>
            <p>{packet.sourceChain}</p>
          </div>
          <Divider />
          <div className="flex flex-row justify-between">
            <p className="mr-8 font-semibold">Destination Chain</p>
            <p>{packet.destChain}</p>
          </div>
          <Divider />

          <div className="flex flex-row justify-between">
            <p className="mr-8 font-semibold">Time Created</p>
            <p>{new Date(packet.createTime*1000).toLocaleString()}</p>
          </div>

          <Divider />
          <div className="flex flex-row justify-between">
            <p className="mr-8 font-semibold">Send Tx</p>
            <Link href={sourceUrl + packet.sendTx} target="_blank"
              className="text-sky-600 dark:text-sky-400 whitespace-nowrap flex flex-row">
              {packet.sendTx} <FiExternalLink className="mt-0.5 ml-0.5"/>
            </Link>
          </div>
          <Divider />
          <div className="flex flex-row justify-between">
            <p className="mr-8 font-semibold">Rcv Tx</p>
            {packet.rcvTx ? (
              <Link href={destUrl + packet.rcvTx} target="_blank"
                className="text-sky-600 dark:text-sky-400 whitespace-nowrap flex flex-row">
                {packet.rcvTx} <FiExternalLink className="mt-0.5 ml-0.5"/>
              </Link>
            ) : (
              <p>...</p>
            )}
          </div>
          <Divider />
          <div className="flex flex-row justify-between">
            <p className="mr-8 font-semibold">Ack Tx</p>
            {packet.ackTx ? (
              <Link href={sourceUrl + packet.ackTx} target="_blank"
                className="text-sky-600 dark:text-sky-400 whitespace-nowrap flex flex-row">
                {packet.ackTx} <FiExternalLink className="mt-0.5 ml-0.5"/>
              </Link>
            ) : (
              <p>...</p>
            )}
          </div>
        </div>
      </>
    }
    </>
  );
}

function Divider () {
  return (
    <div className="flex flex-row justify-center my-0.5">
      <div className="h-0.5 w-[calc(100%-1rem)] border-b border-slate-500/60"></div>
    </div>
  );
}
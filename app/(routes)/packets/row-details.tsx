import { Packet } from 'utils/types/packet';
import Link from 'next/link';
import { FiExternalLink } from "react-icons/fi";

const optimismUrl = "https://optimism-sepolia.blockscout.com/tx/";
const baseUrl = "https://base-sepolia.blockscout.com/tx/";

export function RowDetails(selectedRow: Packet) {
  let sourceUrl = "";
  let destUrl = "";
  if (selectedRow?.sourceChain.startsWith("optimism")) {
    sourceUrl = optimismUrl;
    destUrl = baseUrl;
  } else {
    sourceUrl = baseUrl;
    destUrl = optimismUrl;
  }

  return (selectedRow &&
    <>
      <h1>Packet Details</h1>
      <div className="flex flex-col gap-2 mt-4">

        <div className="flex flex-row justify-between">
          <p className="mr-8 font-semibold">Source Chain</p>
          <p>{selectedRow.sourceChain}</p>
        </div>
        <Divider />
        <div className="flex flex-row justify-between">
          <p className="mr-8 font-semibold">Destination Chain</p>
          <p>{selectedRow.destChain}</p>
        </div>
        <Divider />
        <div className="flex flex-row justify-between">
          <p className="mr-8 font-semibold">Send Tx</p>
          <Link href={sourceUrl + selectedRow.sendTx} target="_blank"
            className="text-sky-600 dark:text-sky-400 whitespace-nowrap flex flex-row">
            {selectedRow.sendTx} <FiExternalLink className="mt-0.5 ml-0.5"/>
          </Link>
        </div>
        <Divider />
        <div className="flex flex-row justify-between">
          <p className="mr-8 font-semibold">Rcv Tx</p>
          {selectedRow.rcvTx ? (
            <Link href={destUrl + selectedRow.rcvTx} target="_blank"
              className="text-sky-600 dark:text-sky-400 whitespace-nowrap flex flex-row">
              {selectedRow.rcvTx} <FiExternalLink className="mt-0.5 ml-0.5"/>
            </Link>
          ) : (
            <p>...</p>
          )}
        </div>
        <Divider />
        <div className="flex flex-row justify-between">
          <p className="mr-8 font-semibold">Ack Tx</p>
          {selectedRow.rcvTx ? (
            <Link href={sourceUrl + selectedRow.ackTx} target="_blank"
              className="text-sky-600 dark:text-sky-400 whitespace-nowrap flex flex-row">
              {selectedRow.ackTx} <FiExternalLink className="mt-0.5 ml-0.5"/>
            </Link>
          ) : (
            <p>...</p>
          )}
        </div>

      </div>
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
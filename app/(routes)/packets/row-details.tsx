import { Packet } from 'utils/types/packet';

export function RowDetails(selectedRow: Packet) {
  return (
    <>
      <h1>Packet Details</h1>
      <div className="flex flex-col gap-2 mt-4">
        <div className="flex flex-row justify-between">
          <p className="mr-4">Packet ID</p>
          <p>{selectedRow?.id}</p>
        </div>
        <div className="flex flex-row justify-between">
          <p className="mr-4">Source Chain</p>
          <p>{selectedRow?.sourceChain}</p>
        </div>
        <div className="flex flex-row justify-between">
          <p className="mr-4">Destination Chain</p>
          <p>{selectedRow?.destChain}</p>
        </div>
        <div className="flex flex-row justify-between">
          <p className="mr-4">Received Tx</p>
          <p>{selectedRow?.rcvTx}</p>
        </div>
        <div className="flex flex-row justify-between">
          <p className="mr-4">Acknowledged Tx</p>
          <p>{selectedRow?.ackTx}</p>
        </div>
      </div>
    </>
  );
}
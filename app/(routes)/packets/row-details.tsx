import { Packet } from 'utils/types/packet';

export function RowDetails(selectedRow: Packet) {
  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row justify-between">
          <h3>Packet ID</h3>
          <p>{selectedRow?.id}</p>
        </div>
        <div className="flex flex-row justify-between">
          <h3>Source Chain</h3>
          <p>{selectedRow?.sourceChain}</p>
        </div>
        <div className="flex flex-row justify-between">
          <h3>Destination Chain</h3>
          <p>{selectedRow?.destChain}</p>
        </div>
        <div className="flex flex-row justify-between">
          <h3>Received Tx</h3>
          <p>{selectedRow?.rcvTx}</p>
        </div>
        <div className="flex flex-row justify-between">
          <h3>Acknowledged Tx</h3>
          <p>{selectedRow?.ackTx}</p>
        </div>
      </div>
    </>
  );
}
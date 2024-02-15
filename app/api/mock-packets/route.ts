import { NextResponse } from "next/server";
import { Packet, PacketStates } from "utils/types/packet";

export function GET() {
  let packets: Packet[] = [];
  for (let i = 0; i < 10; i++) {
    packets.push(testPacket);
  }
  return NextResponse.json(packets);
}

const testPacket: Packet = {
  sequence: "3",
  sourcePortAddress: "0xedd5599e42e5f8ce2a6442348337ac344c6e11ed6436d446fd8025f27e6a67eb",
  sourceChannelId: "channel-11",
  destPortAddress: "0x03b308b0091c8d1fec5406cff741352a2e66ae28",
  destChannelId: "channel-12",
  timeout: "1000",
  fee: "1ETH",
  id: "packet-1",
  state: PacketStates.ACK,
  createTime: 1630000000,
  endTime: 1630010000,
  sendTx: "0xedd5599e42e5f8ce2a6442348337ac344c6e11ed6436d446fd8025f27e6a67eb",
  rcvTx: "0xa58af813c09e47b3e8288e92c72c5a11ecf7249492e95ba17bc888a7ffa7786d",
  ackTx: "0x8b965a68268506322a428252f18274ba7c20fb6a87d9d36d949aa94e4b32700b",
  sourceChain: "optimism",
  destChain: "base"
};

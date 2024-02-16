import { NextRequest, NextResponse } from "next/server";
import { Packet, PacketStates } from "utils/types/packet";

function getRandomHexString(length: number): string {
  const characters = 'abcdef0123456789';
  let result = '0x';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function GET(request: NextRequest) {
  const reqParams = request.nextUrl.searchParams;
  const size = reqParams.get("size") ? parseInt(reqParams.get("size") as string) : 10;
  const packets: Packet[] = [];

  for (let i = 1; i <= size; i++) {
    const createTime = Date.now();
    const endTime = createTime + Math.floor(Math.random() * (120000 - 7000)) + 7000; // Random time between 7 and 120 seconds

    const packet: Packet = {
      sequence: i.toString(),
      sourcePortAddress: getRandomHexString(64),
      sourceChannelId: `channel-${i}`,
      destPortAddress: getRandomHexString(40),
      destChannelId: `channel-${i + 1}`,
      timeout: "1000",
      fee: "1ETH",
      id: `packet-${i}`,
      state: PacketStates.ACK,
      createTime,
      endTime,
      sendTx: getRandomHexString(64),
      rcvTx: getRandomHexString(64),
      ackTx: getRandomHexString(64),
      sourceChain: Math.random() < 0.5 ? "optimism" : "base",
      destChain: Math.random() < 0.5 ? "optimism" : "base",
    };
    packets.push(packet);
  }
  return NextResponse.json(packets);
}

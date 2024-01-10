import { getChannels, getClients, getConnections } from "./ibc";
import { NextRequest, NextResponse } from "next/server";
import { getPackets } from "./packets";

export const dynamic = 'force-dynamic' // defaults to auto
export async function GET(request: NextRequest,
                          {params}: { params: { type: "channels" | "connections" | "clients" | "packets" } }
) {
  const type = params.type

  let apiUrl = process.env.API_URL!;

  try {
    switch (type) {
      case "channels":
        let data = await getChannels(apiUrl);
        return Response.json(data)
      case "connections":
        return Response.json(await getConnections(apiUrl))
      case "clients":
        return Response.json(await getClients(apiUrl))
      case "packets":
        return Response.json(await getPackets(request, apiUrl))
    }
  } catch (e) {
    return NextResponse.error()
  }
}
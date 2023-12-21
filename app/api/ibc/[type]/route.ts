import { getChannels, getClients, getConnections } from "./ibc";

export const dynamic = 'force-dynamic' // defaults to auto
export async function GET(request: Request,
                          {params}: { params: { type: "channels" | "connections" | "clients" } }
) {
  const type = params.type

  let apiUrl = process.env.API_URL!;
  console.log("API URL: ", apiUrl)

  switch (type) {
    case "channels":
      let data = await getChannels(apiUrl);
      return Response.json(data)
    case "connections":
      return Response.json(await getConnections(apiUrl))
    case "clients":
      return Response.json(await getClients(apiUrl))
  }
}
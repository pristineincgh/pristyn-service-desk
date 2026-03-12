import { NextRequest } from "next/server";
import { proxyApiRequest } from "../proxy";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.toString();

  return proxyApiRequest(request, {
    path: `/activity${query ? `?${query}` : ""}`,
    method: "GET",
    serviceName: "activity service",
  });
}

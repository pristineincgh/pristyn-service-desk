import { NextRequest } from "next/server";
import { proxyApiRequest } from "../../proxy";

export async function GET(request: NextRequest) {
  return proxyApiRequest(request, {
    path: "/auth/me",
    method: "GET",
    serviceName: "auth service",
  });
}

export async function PATCH(request: NextRequest) {
  return proxyApiRequest(request, {
    path: "/auth/me",
    method: "PATCH",
    parseRequestBody: true,
    serviceName: "auth service",
    parseResponseErrorMessage: "Unable to parse profile update response",
  });
}

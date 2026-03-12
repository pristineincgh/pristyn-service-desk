import { NextRequest } from "next/server";
import { proxyApiRequest } from "../../proxy";

export async function POST(request: NextRequest) {
  return proxyApiRequest(request, {
    path: "/auth/change-password",
    method: "POST",
    parseRequestBody: true,
    serviceName: "auth service",
    parseResponseErrorMessage: "Unable to parse change password response",
  });
}

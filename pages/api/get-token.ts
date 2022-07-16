import type { NextApiRequest, NextApiResponse } from "next";
import twilio from "twilio";
import jwt_decode from "jwt-decode";
require("dotenv").config();

const {
  NEXT_PUBLIC_ACCOUNT_SID,
  NEXT_PUBLIC_API_KEY_SID,
  NEXT_PUBLIC_API_KEY_SECRET,
} = process.env;

export default async function GetToken(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // get JWT from header
  const token = req.headers.authorization || "";

  const decoded: JWT_HASURA = jwt_decode(token.replace("Bearer ", ""));

  const identity =
    decoded["https://hasura.io/jwt/claims"]["x-hasura-user-id"] || null;

  if (!identity) {
    res.status(401).json({
      error: "Invalid token",
    });
    return;
  }

  const { AccessToken } = twilio.jwt;
  const { ChatGrant } = AccessToken;

  const accessToken = new AccessToken(
    NEXT_PUBLIC_ACCOUNT_SID || "",
    NEXT_PUBLIC_API_KEY_SID || "",
    NEXT_PUBLIC_API_KEY_SECRET || "",
    {
      identity,
    }
  );

  const conversationGrant = new ChatGrant({
    serviceSid: process.env.NEXT_PUBLIC_SERVICE_SID,
    pushCredentialSid: "CR1f451f7851a5c1f3abdef1e6264496b5",
  });

  accessToken.addGrant(conversationGrant);

  res.status(200).json({
    token: accessToken.toJwt(),
    ttl: accessToken.ttl,
  });
}

type JWT_HASURA = {
  "https://hasura.io/jwt/claims": {
    "x-hasura-allowed-roles": string[];
    "x-hasura-default-role": string;
    "x-hasura-user-id": string;
    "x-hasura-user-is-anonymous": boolean;
  };
  sub: string;
  iss: string;
  iat: number;
  exp: number;
};

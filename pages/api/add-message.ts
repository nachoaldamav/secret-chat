import type { NextApiRequest, NextApiResponse } from "next";
import { GraphQLClient, gql } from "graphql-request";
require("dotenv").config();

const accountSid = process.env.NEXT_PUBLIC_ACCOUNT_SID;
const authToken = process.env.NEXT_PUBLIC_AUTH_TOKEN;

const client = new GraphQLClient(
  "https://npvetwtkmbcbxsrqpprc.nhost.run/v1/graphql",
  {
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": process.env.HASURA_ADMIN_SECRET || "",
    },
  }
);

const query = gql`
  mutation UpdateRoom($_eq: uuid = _eq, $updated_at: timestamptz = updated_at) {
    update_room(
      where: { id: { _eq: $_eq } }
      _set: { updated_at: $updated_at }
    ) {
      affected_rows
    }
  }
`;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get content from application/x-www-urlencoded
  const sid = req.body.ConversationSid;

  // Find conversation by ConversationSID
  const friendlyName = await fetch(
    `https://conversations.twilio.com/v1/Services/${process.env.NEXT_PUBLIC_SERVICE_SID}/Conversations/${sid}`,
    {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${accountSid}:${authToken}`
        ).toString("base64")}`,
      },
    }
  )
    .then((response) => response.json())
    .then((data) => data.unique_name);

  const currentDate = new Date();
  const dateString = currentDate.toISOString();

  try {
    await client.request(query, {
      _eq: friendlyName,
      updated_at: dateString,
    });
    res.status(200).json({ message: "Success" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
    return;
  }
}

import type { NextApiRequest, NextApiResponse } from "next";
import { GraphQLClient, gql } from "graphql-request";
require("dotenv").config();

const HASURA_ACCESS_TOKEN = process.env.HASURA_ADMIN_SECRET;

const client = new GraphQLClient(
  "https://npvetwtkmbcbxsrqpprc.nhost.run/v1/graphql",
  {
    headers: {
      "Content-Type": "application/json",
      "x-hasura-admin-secret": HASURA_ACCESS_TOKEN || "",
    },
  }
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { string } = req.query;

  console.log("[Parse Message]: Parsing message: ", string);

  if (!string) {
    res.status(400).send("No string provided");
    return;
  }

  const str = string as string;

  const [conversation, user, message] = str.split(":");

  const data = await client.request(QUERY, {
    id: user,
    _eq: conversation,
  });

  if (!data) {
    res.status(500).json({ error: "Internal server error" });
  }

  if (data) {
    res.status(200).json({
      user: data.user.displayName,
      conversation: data.room[0].name || "Sala sin nombre",
      message: message.trim() || "",
      roomId: conversation,
    });
  }
}

const QUERY = gql`
  query parseNotification($id: uuid = id, $_eq: uuid = _eq) {
    user(id: $id) {
      displayName
    }
    room(where: { id: { _eq: $_eq } }) {
      name
    }
  }
`;

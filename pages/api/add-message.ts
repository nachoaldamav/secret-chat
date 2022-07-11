import type { NextApiRequest, NextApiResponse } from "next";
import { GraphQLClient, gql } from "graphql-request";
require("dotenv").config();

export const config = {
  runtime: "experimental-edge",
};

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
  const friendlyName = req.body.friendlyName;

  if (!friendlyName) {
    res.status(400).json({ error: "No friendly name provided" });
    return;
  }

  const currentDate = new Date();
  const dateString = currentDate.toISOString();

  try {
    await client.request(query, {
      _eq: friendlyName,
      updated_at: dateString,
    });
    res.status(200).json({ message: "Success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
}

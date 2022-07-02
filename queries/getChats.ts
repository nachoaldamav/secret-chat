import { gql } from "@apollo/client";
import { nhost } from "../libs/nhost";
import getUserId from "./getUserId";

export default async function getChats() {
  const id = getUserId();
  if (!id) {
    return null;
  }

  const { data, error } = await nhost.graphql.request(gql`
    query getChats {
      participates(
        where: { user_id: { _eq: "5fb2d415-a575-448e-b32a-c78be8f01665" } }
      ) {
        id
        chat {
          participants {
            user_data {
              id
            }
          }
          Messages(limit: 1, order_by: { created_at: desc }) {
            id
            raw
            created_at
            media
          }
        }
      }
    }
  `);

  const chats = data?.participates;

  console.log(chats);

  if (error) {
    console.error(error);
    return {
      error: error,
      data: null,
    };
  }

  return {
    data,
    error: null,
  };
}

export type Chat = {
  id: string;
  Messages_aggregate: {
    nodes: {
      raw: string;
      created_at: string;
    }[];
  };
  participates_aggregate: {
    nodes: {
      user: {
        avatar: string;
        id: string;
        user: {
          displayName: string;
          avatarUrl: string;
        };
      };
    }[];
  };
};

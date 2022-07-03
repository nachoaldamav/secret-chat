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
      chat_aggregate(where: {user_id: {_eq: "${id}"}}) {
    nodes {
      id
      user_data {
        connected
        custom_avatar
        id
        last_seen
        typing
        user {
          displayName
          avatarUrl
        }
      }
    }
  }
    }
  `);

  console.log(data);
  console.log(error);

  return { data, error };
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

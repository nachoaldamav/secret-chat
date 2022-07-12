import { gql } from "@apollo/client";
import { nhost } from "../libs/nhost";
import getUserId from "./getUserId";

const QUERY_LOCAL = gql`
  query getChats($_eq: uuid = _eq) {
    room(
      order_by: { updated_at: desc }
      where: { chats: { user_id: { _eq: $_eq } } }
    ) {
      id
      icon
      creator_id
      updated_at
      chats(where: { user_id: { _eq: $_eq } }) {
        user_data {
          custom_avatar
          id
          user {
            avatarUrl
            displayName
          }
        }
      }
    }
  }
`;

const QUERY_PROD = gql`
  subscription getRooms($_eq: uuid = _eq) {
    room(
      order_by: { updated_at: desc }
      where: { chats: { user_id: { _eq: $_eq } } }
      distinct_on: updated_at
    ) {
      id
      icon
      creator_id
      updated_at
      chats {
        user_data {
          custom_avatar
          id
          user {
            avatarUrl
            displayName
          }
        }
      }
    }
  }
`;

export default async function getChats() {
  const id = getUserId();
  if (!id) {
    return null;
  }

  const { data, error } = await nhost.graphql.request(QUERY_LOCAL, {
    _eq: id,
  });

  return { data, error };
}

let MOCK = {
  id: "f5091ac9-0a51-4bac-a025-856cfbc3a767",
  icon: null,
  chats: [
    {
      user_data: {
        custom_avatar: null,
        id: "5fb2d415-a575-448e-b32a-c78be8f01665",
        user: {
          avatarUrl:
            "https://s.gravatar.com/avatar/256341847248f16b1c5520b0c0a42c28?r=g&default=blank",
          displayName: "nachoaldama",
        },
      },
    },
    {
      user_data: {
        custom_avatar: null,
        id: "39c14473-8267-4014-96e6-fda67dc21379",
        user: {
          avatarUrl:
            "https://s.gravatar.com/avatar/55502f40dc8b7c769880b10874abc9d0?r=g&default=blank",
          displayName: "test@example.com",
        },
      },
    },
  ],
};

export type Chat = {
  id: string;
  icon: string | null;
  creator_id: string;
  updated_at: string;
  chats: [
    {
      user_data: {
        custom_avatar: string | null;
        id: string;
        user: {
          avatarUrl: string;
          displayName: string;
        };
      };
    }
  ];
};

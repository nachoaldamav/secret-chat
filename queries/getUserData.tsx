import { gql } from "@apollo/client";
import { nhost } from "../libs/nhost";
import getUserId from "./getUserId";

const QUERY = gql`
  query getUser($_eq: uuid = _eq) {
    user_data(where: { id: { _eq: $_eq } }) {
      custom_avatar
      id
      user {
        displayName
      }
    }
  }
`;

export default async function getUserData() {
  const userId = getUserId();
  if (userId) {
    const { data } = await nhost.graphql.request(QUERY, { _eq: userId });
    return data.user_data[0];
  } else {
    return null;
  }
}

export type UserData = {
  custom_avatar: string;
  id: string;
  user: {
    displayName: string;
  };
};

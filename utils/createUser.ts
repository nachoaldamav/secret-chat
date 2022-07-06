import { gql } from "@apollo/client";
import { nhost } from "../libs/nhost";
import getUserId from "../queries/getUserId";

const QUERY = gql`
  mutation addUser($id: uuid = id) {
    insert_user_data_one(object: { id: $id }) {
      id
    }
  }
`;

export default async function createUser() {
  const userId = getUserId();
  return await nhost.graphql.request(QUERY, { id: userId });
}

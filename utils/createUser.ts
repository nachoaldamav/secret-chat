import { gql } from "@apollo/client";
import { nhost } from "../libs/nhost";
import getUserId from "../queries/getUserId";

const QUERY = gql`
  mutation MyMutation($id: uuid = id) {
    insert_user_data(objects: { id: $id }) {
      affected_rows
    }
  }
`;

export default async function createUser(accessToken: string) {
  const userId = getUserId();
  nhost.graphql.setAccessToken(accessToken);
  try {
    const response = await nhost.graphql.request(QUERY, { id: userId });
    return response;
  } catch (err) {
    console.log(err);
    return err;
  }
}

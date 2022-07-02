import { nhost } from "../libs/nhost";

export default function getUserId() {
  const user = nhost.auth.getUser();
  return user?.id || null;
}

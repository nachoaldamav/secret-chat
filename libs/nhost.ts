import { NhostClient } from "@nhost/react";

export const nhost = new NhostClient({
  subdomain: "npvetwtkmbcbxsrqpprc",
  region: "eu-central-1",
  autoRefreshToken: true,
  refreshIntervalTime: 1000 * 60 * 60 * 24 * 30,
});

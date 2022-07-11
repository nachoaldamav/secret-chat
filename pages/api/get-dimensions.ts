import type { NextApiRequest, NextApiResponse } from "next";
import probe from "probe-image-size";

export const config = {
  runtime: "experimental-edge",
};

export default async function GetImageSize(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { url } = req.query;
  if (!url) {
    res.status(400).json({
      error: "Missing url",
    });
    return;
  }

  const { width, height } = await probe(url as string);
  res.status(200).json({
    width,
    height,
  });
}

import type { NextApiRequest, NextApiResponse } from "next";
import * as vision from "@google-cloud/vision";
require("dotenv").config();

const client = new vision.ImageAnnotatorClient({
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_MAIL,
    private_key: process.env.GOOGLE_CLOUD_SECRET?.replace(/\\n/g, "\n") || "",
  },
});

export default async function SafeImage(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { image } = req.body;

  if (!image) {
    res.status(400).json({
      error: "Missing image",
    });
    console.log(req.body);
    return;
  }

  try {
    const [result] = await client.safeSearchDetection({
      image: {
        source: {
          imageUri: image,
        },
      },
    });

    const safe = result.safeSearchAnnotation;

    res.status(200).json({
      safe,
    });
  } catch (err) {
    console.log({
      client_email: process.env.GOOGLE_CLOUD_MAIL,
      private_key: process.env.GOOGLE_CLOUD_SECRET?.replace(/\\n/g, "\n") || "",
    });
    res.status(500).json({
      error: "Something went wrong",
    });
  }
}

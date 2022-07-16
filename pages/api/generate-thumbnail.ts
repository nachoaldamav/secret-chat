import type { NextApiRequest, NextApiResponse } from "next";
import * as cheerio from "cheerio";
const needle = require("needle");
require("dotenv").config();

export default async function GenerateThumbnail(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.setHeader("Cache-Control", "s-maxage=3600, max-age=3600");

  const { url } = req.query;
  if (!url) {
    res.status(400).json({
      error: "Missing url",
    });
    return;
  }

  const data: PageProps = await new Promise(async (resolve, reject) => {
    await needle("get", url as string, function (err: any, res: any) {
      if (err) {
        console.error(err);
        reject(err);
      }
      const $ = cheerio.load(res.body);
      const title = $('meta[property="og:title"]').attr("content");
      const image = $('meta[property="og:image"]').attr("content");
      const description = $('meta[property="og:description"]').attr("content");

      resolve({
        title,
        image,
        description,
      });
    });
  });

  const { title, image, description } = data;

  if (!title || !image) {
    try {
      const backup = await getMetatags(url as string);
      res.status(200).json(backup);
    } catch (e) {
      console.error(e);
      res.status(500).json({
        error: "Could not get metatags",
      });
    }
    return;
  }

  res.status(200).json({
    title,
    image: validateImage(image, url as string),
    description,
  });
}

async function getMetatags(url: string) {
  return fetch(
    `http://api.linkpreview.net/?key=${process.env.LINK_PREVIEW_KEY}&q=${url}`
  )
    .then(async (response) => {
      const data = await response.json();
      return {
        title: data.title,
        image: validateImage(data.image, url),
        description: data.description,
      };
    })
    .catch((err) => {
      throw err;
    });
}

function validateImage(image: string, url: string) {
  const domain = new URL(url).hostname;

  if (image.startsWith("/")) {
    return `https://${domain}${image}`;
  }

  return image;
}

type PageProps = {
  title?: string;
  image?: string;
  description?: string;
};

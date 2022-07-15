import type { NextApiRequest, NextApiResponse } from "next";
import { Chat, ChatEvents } from "twitch-js";
require("dotenv").config();

const username = process.env.TWITCH_USERNAME;
const token = process.env.TWITCH_TOKEN;
const channel = "midudev";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const chat = new Chat({ username, token });
  await chat.connect();
  await chat.join(channel);

  let users: string[] = [];

  chat.on("message", async (message) => {
    // Get messages that stars with !add-username
    message._raw.split(" ").forEach((word) => {
      if (word.startsWith("!add-username")) {
        const username = word.split(" ")[1];
        users.push(username);
      }
    });
  });

  setTimeout(() => {
    res.status(200).json({ users });
    chat.disconnect();
  }, 15000);
}

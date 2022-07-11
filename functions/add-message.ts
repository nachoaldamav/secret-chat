import { Request, Response } from "express";

export default function request(req: Request, res: Response) {
  const body = req.body;
  console.log(body);
  res
    .status(200)
    .send(`Nhost, from Typescript, pays it's respects to ${req.query.name}!`);
}

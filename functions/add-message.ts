/* eslint-disable import/no-anonymous-default-export */

import { Request, Response } from "express";
export default (req: Request, res: Response) => {
  res
    .status(200)
    .send(`Nhost, from Typescript, pays it's respects to ${req.query.name}!`);
};

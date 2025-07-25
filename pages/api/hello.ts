// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  ip: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const ip = req.socket.localAddress;

  console.log(`Poking endpoints from ${ip}`);
  if (!ip) {
    return res.status(400).json({ ip: "No IP" });
  }
  res.status(200).json({ ip });
}

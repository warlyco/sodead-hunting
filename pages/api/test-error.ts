import { logError } from "@/utils/log-error";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { error, burnTxAddress, walletId } = req.body;

  try {
    logError({
      error: {
        code: error?.code || 0,
        message: error?.message,
        rawError: JSON.stringify(error),
      },
      walletId,
      burnTxAddress,
    });
  } catch (error) {
    console.log("error logging error", error);
  }

  res.status(200).json({ name: "John Doe" });
}

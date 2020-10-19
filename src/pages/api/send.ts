import { NextApiRequest, NextApiResponse } from "next"
import { sendMessage } from "../../data/bot"
import { getDbInstance, save } from "../../data/db"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    res
      .status(400)
      .json({ success: false, error: "ONLY POST ALLOWED IN /api/send" })
    return
  }
  const body = req.body
  if (!body || !body.apiKey) {
    res.status(401).json({ success: false, error: "NO API KEY PROVIDED" })
    return
  }
  if (!body.message) {
    res.status(400).json({ success: false, error: "NO MESSAGE PROVIDED" })
    return
  }
  const db = await getDbInstance()
  const keys = db.getCollection("keys") || db.addCollection("keys")
  if (
    keys.findOne({
      key: body.apiKey,
    }) === null
  ) {
    res.status(403).json({ success: false, error: "API KEY NOT FOUND" })
    return
  }
  sendMessage(body.message, body.schedule)
    .then(() => res.status(200).json({ success: true }))
    .catch((error) => res.status(500).json({ success: false, error }))
}

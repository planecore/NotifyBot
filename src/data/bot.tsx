import TelegramBot from "node-telegram-bot-api"
import { getDbInstance } from "./db"

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: false })

export const sendMessage = async (
  message: string,
  schedule?: string
): Promise<void> => {
  const db = await getDbInstance()
  const messages = db.getCollection("messages") || db.addCollection("messages")
  return new Promise((resolve, reject) => {
    if (schedule === undefined) {
      bot
        .sendMessage(process.env.CHAT_ID, message)
        .then((_msg) => {
          messages.insert({
            message: message,
            schedule: new Date(),
            sent: true,
          })
          db.save(() => resolve())
        })
        .catch(() => reject())
    } else {
      messages.insert({
        message: message,
        schedule: new Date(schedule),
        sent: false,
      })
      db.save(() => resolve())
    }
  })
}

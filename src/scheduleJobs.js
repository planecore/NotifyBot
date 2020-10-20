const schedule = require("node-schedule")
const loki = require("lokijs")
const TelegramBot = require("node-telegram-bot-api")

const chatId = process.env.CHAT_ID

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: chatId === undefined || chatId === "",
})

if (chatId === undefined || chatId === "") {
  bot.onText(/\/get_chat_id/, (msg, _match) => {
    bot.sendMessage(msg.chat.id, msg.chat.id)
  })
} else {
  // Send messages in queue every minute
  sendMessagesInQueue()
  scheduleJob()

  function sendMessagesInQueue() {
    const db = new loki("./db/notifybot.db")
    db.loadDatabase({}, () => {
      const messages =
        db.getCollection("messages") || db.addCollection("messages")
      messages.findAndUpdate(
        {
          sent: false,
          schedule: {
            $lte: new Date(Date.now() + 58 * 1000).toISOString(),
          },
        },
        (obj) => {
          try {
            bot.sendMessage(chatId, obj.message)
            obj.sent = true
            return obj
          } catch (e) {
            console.log("Couldn't send message")
            console.log(e)
            obj.sent = false
            return obj
          }
        }
      )
      db.save()
    })
  }

  function scheduleJob() {
    schedule.scheduleJob("* * * * *", async () => {
      sendMessagesInQueue()
    })
  }
}

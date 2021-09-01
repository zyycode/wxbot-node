#!/usr/bin/env node
const { Wechaty, config } = require('wechaty');
const qrTerm = require('qrcode-terminal');
// const fetch = require('node-fetch');
const schedule = require('node-schedule');
const { PuppetPadlocal } = require('wechaty-puppet-padlocal');

const token = 'puppet_padlocal_3e302874a4f64bce9c0851c018544a95';

const ROOM_NAME = '90';

const puppet = new PuppetPadlocal({
  token
});

/**
 *
 * Declare the Bot
 *
 */
const bot = new Wechaty({
  name: 'zyy-wx-bot',
  puppet
});

/**
 *
 * Register event handlers for Bot
 *
 */
bot
  .on('logout', onLogout)
  .on('login', onLogin)
  .on('scan', onScan)
  .on('error', onError)
  .on('message', onMessage)
  .on('room-join', onRoomJoin);

/**
 *
 * Start the bot!
 *
 */
// getDaily()
bot.start().catch(async e => {
  console.error('Bot start() fail:', e);
  await bot.stop();
  process.exit(-1);
});

/**
 *
 * Define Event Handler Functions for:
 *  `scan`, `login`, `logout`, `error`, and `message`
 *
 */
function onScan(qrcode, status) {
  qrTerm.generate(qrcode, { small: true });

  // Generate a QR Code online via
  // http://goqr.me/api/doc/create-qr-code/
  const qrcodeImageUrl = ['https://wechaty.js.org/qrcode/', encodeURIComponent(qrcode)].join('');

  console.log(`[${status}] ${qrcodeImageUrl}\nScan QR Code above to log in: `);
}

async function onLogin(user) {
  console.log(`${user.name()} login`);
  schedule.scheduleJob('00 00 08 * * 0-6', () => {
    sendDaily(1);
  });
  schedule.scheduleJob('00 30 11 * * 0-6', () => {
    sendDaily(2);
  });
  schedule.scheduleJob('00 50 17 * * 0-6', () => {
    sendDaily(3);
  });
  schedule.scheduleJob('00 00 00 * * 0-6', () => {
    sendDaily(4);
  });
  // schedule.scheduleJob('40 50 16 * * 1-5', sendDaily); //send daily on 16:50:40 every weekday
}

function onLogout(user) {
  console.log(`${user.name()} logouted`);
}

function onError(e) {
  console.error('Bot error:', e);
}

/**
 * send a daily
 */
async function sendDaily(type) {
  const room = await bot.Room.find({ topic: ROOM_NAME }); //get the room by topic
  let dailyText = await getDailyText(type);
  room.say(dailyText);
  // if (type !== 4) {
  //   const members = await room.memberAll()
  //   room.say(dailyText, ...members);
  // } else {
  //   room.say(dailyText);
  // }
}

/**
 * list of the news details
 * @type {Array}
 */
let preNewsList = [];
/**
 *
 * Dealing with Messages
 *
 */
async function onMessage(msg) {
  // console.log(msg.toString());

  if (msg.type() !== bot.Message.Type.Text) {
    console.log('Message discarded because it is not a text message');
    return;
  }

  let msgText = msg.text();
  const room = await bot.Room.find({ topic: ROOM_NAME });

  if (room) {
    console.log(msg.toString());
    const contact = msg.talker();

    const arr = ['我好烦', '我好难过', '我很烦', '我很难过', '最近好难', '最近好烦'];

    for (const item of arr) {
      if (msgText.indexOf(item) > -1) {
        room.say(
          contact.name() +
            ' 雪莱曾说过：“黑夜给了我一双黑色的眼睛，我去用它去寻找光明”，烦躁，难过的日子总是短暂的，快乐的日子终会来临 [加油]'
        );
        break;
      }
    }

    if (msgText === '难混') {
      room.say(contact.name() + '打工人，加油 [加油][加油][加油]');
    }

    if (msgText.indexOf('ghs') > -1 || msgText.indexOf('GHS') > -1) {
      room.say('富强、民主、文明、和谐，自由、平等、公正、法治，爱国、敬业、诚信、友善');
    }

    // invite to room
    room.on('join', (room, inviteeList, inviter) => {
      console.log(`Room got new member ${nameList}, invited by ${inviter}`);
      inviteeList.forEach(c => {
        room.say(
          '\n' +
            '欢迎 ' +
            c.name() +
            ' 新人爆照，群里的女生知性端庄，男生温文儒雅，希望因为有你的存在而有一点点不一样 [庆祝][庆祝][庆祝]'
        );
      });
    });

    // leave room
    room.on('leave', (room, leaverList = []) => {
      console.log(`Room lost member ${nameList}`);
      leaverList.forEach(c => {
        room.say(
          c.name() +
            ' 离开了群聊，其实没什么遗憾，这世上没有谁能够一直陪着谁，' +
            c.name() +
            ' 江湖再见~'
        );
      });
    });
  }
}

/**
 *
 * @param {*} room 房间
 * @param {*} inviteeList
 * @param {*} inviter
 * @returns
 */
async function onRoomJoin(room, inviteeList = [], inviter) {
  // const group = await Group.findOne({ id: room.id }, { roomJoinReply: 1 });
  // if (!group) {
  //   room.payload.robotId = global.bot.id;
  //   await Group.create(room.payload);
  //   room.say(
  //     `大家好，我是机器人${global.bot.options.name}\n欢迎大家找我聊天或者玩游戏哦。比如 @${global.bot.options.name} 成语接龙`
  //   );
  //   return;
  // }
  // inviteeList.forEach(c => {
  //   room.say('\n' + group.roomJoinReply, c);
  // });
}

function getDailyText(type) {
  if (type === 1)
    return '今天又是元气满满的一天，新的一天新的开始，大家不要忘记吃早饭哟 [太阳][太阳][太阳]~';
  if (type === 2) return '快到中午了，上了一上午的班怪累的，大家记得补充能量哦 [加油][加油][加油]~';
  if (type === 3)
    return '一天快要结束了，虽然群主还要搬砖，但祝福大家早点回家陪心爱的人一起享受晚餐 [月亮][月亮][月亮]~';
  if (type === 4) return '已经凌晨了，早点休息吧，身体是革命的本钱~';
}

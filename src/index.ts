// tslint:disable-next-line: no-var-requires
require('dotenv').config()
import TelegramBot, { ContextMessageUpdate } from 'telegraf'
import { Bot } from './bot'
import { promiseCatcher } from './utils'
const commands = {
  banUser: 'ban',
  demote: 'demote',
  getPermission: 'permission',
  promote: 'promote',
  startKulgram: 'startKulgram',
  startQna: 'startQna',
  stopKulgram: 'stopKulgram',
  stopQna: 'stopQna',
  unBan: 'unBan'
}
const coolgramBot = new TelegramBot(process.env.BOT_TOKEN!)
const bot = new Bot()
coolgramBot.command(commands.startKulgram, ctx => {
  promiseCatcher(bot.startKulgram(ctx))
})
coolgramBot.command(commands.startQna, ctx => {
  promiseCatcher(bot.startQna(ctx))
})

coolgramBot.command(commands.stopQna, ctx => {
  promiseCatcher(bot.stopQna(ctx))
})

coolgramBot.command(commands.stopKulgram, ctx => {
  promiseCatcher(bot.stopKulgram(ctx))
})

coolgramBot.on('text', ctx => {
  promiseCatcher(bot.handleMessage(ctx))
})

coolgramBot.catch((err: any, _ctx: ContextMessageUpdate) => {
  console.log(err)
})

promiseCatcher(coolgramBot.launch())

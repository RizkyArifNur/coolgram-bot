// tslint:disable-next-line: no-var-requires
require('dotenv').config()
import TelegramBot, { ContextMessageUpdate } from 'telegraf'
import { Bot } from './bot'
import { ErrorProvider } from './provider/error-provider'
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

coolgramBot.use(async (ctx, next) => {
  const { status } = await ctx.getChatMember(ctx.from!.id)
  if (status === 'member' && Object.values(commands).indexOf(ctx.message!.text!.substr(1)) > -1) {
    await ctx.reply('Maaf, kamu bukan admin di grup ini !')
  } else {
    next!()
  }
})

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

coolgramBot.catch((err: any, ctx: ContextMessageUpdate) => {
  if (err instanceof ErrorProvider) {
    if (err.showError) {
      promiseCatcher(ctx.reply(err.message))
    }
  }
})

promiseCatcher(coolgramBot.launch())

// tslint:disable-next-line: no-var-requires
require('dotenv').config()
import TelegramBot from 'telegraf'
import { MessageController } from './temp/message-controller'
import { StateController } from './temp/state-controller'
import { promiseCatcher } from './utils'
const commands = {
  startKulgram: 'startKulgram',
  startQna: 'startQna',
  stopKulgram: 'stopKulgram',
  stopQna: 'stopQna'
}
const coolgramBot = new TelegramBot(process.env.BOT_TOKEN!)
coolgramBot.command(commands.startKulgram, ctx => {
  StateController.setState(ctx.message!.chat.id, 'STARTED')
})
coolgramBot.command(commands.startQna, ctx => {
  StateController.setState(ctx.message!.chat.id, 'START-QNA')
})

coolgramBot.command(commands.stopQna, ctx => {
  StateController.setState(ctx.message!.chat.id, 'STARTED')
})

coolgramBot.command(commands.stopKulgram, ctx => {
  StateController.setState(ctx.message!.chat.id, 'STOPED')
})
coolgramBot.on('text', ctx => {
  MessageController.handleMessage(ctx.message!)
})

promiseCatcher(coolgramBot.launch())

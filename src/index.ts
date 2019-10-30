// tslint:disable-next-line: no-var-requires
require('dotenv').config()
import TelegramBot from 'telegraf'
import { MessageController } from './temp/message-controller'
import { StateController } from './temp/state-controller'
import { makePdf, promiseCatcher } from './utils'
const commands = {
  startKulgram: 'startKulgram',
  startQna: 'startQna',
  stopKulgram: 'stopKulgram',
  stopQna: 'stopQna'
}
const coolgramBot = new TelegramBot(process.env.BOT_TOKEN!)
coolgramBot.command(commands.startKulgram, ctx => {
  promiseCatcher(ctx.reply('Apa judul kulgram anda?'))
  StateController.setState(ctx.message!.chat.id, 'STARTING')
})
coolgramBot.command(commands.startQna, ctx => {
  StateController.setState(ctx.message!.chat.id, 'START-QNA')
})

coolgramBot.command(commands.stopQna, ctx => {
  StateController.setState(ctx.message!.chat.id, 'STARTED')
})

coolgramBot.command(commands.stopKulgram, ctx => {
  StateController.setState(ctx.message!.chat.id, 'STOPED')
  const message = MessageController.read(ctx.chat!.id)!
  makePdf(message)
  promiseCatcher(ctx.telegram.sendDocument(ctx.chat!.id, { filename: 'recap.pdf', source: 'recap.pdf' }))
})
coolgramBot.on('text', ctx => {
  const botState = StateController.readState().find(s => (s.chatId = ctx.chat!.id))
  if (botState && botState.state === 'STARTING') {
    promiseCatcher(ctx.reply('Siapa author kulgramnya ?'))
  } else if (botState && botState.state === 'PICK-AUTHOR') {
    promiseCatcher(ctx.reply('Ok Kulgram di mulai !'))
  }
  MessageController.handle(ctx.message!)
})

promiseCatcher(coolgramBot.launch())

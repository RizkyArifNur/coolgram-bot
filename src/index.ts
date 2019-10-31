// tslint:disable-next-line: no-var-requires
require('dotenv').config()
import TelegramBot from 'telegraf'
import { ChatStateRepository } from './repository/chat-state-repository'
import { SessionController } from './temp/message-controller'
import { makePdf, promiseCatcher } from './utils'
const commands = {
  startKulgram: 'startKulgram',
  startQna: 'startQna',
  stopKulgram: 'stopKulgram',
  stopQna: 'stopQna'
}
const coolgramBot = new TelegramBot(process.env.BOT_TOKEN!)
const chatStateRepository = new ChatStateRepository()
const sessionController = new SessionController(chatStateRepository)

coolgramBot.command(commands.startKulgram, ctx => {
  promiseCatcher(ctx.reply('Apa judul kulgram anda?'))
  chatStateRepository.upsert({ id: ctx.message!.chat.id, state: 'STARTING' })
})
coolgramBot.command(commands.startQna, ctx => {
  chatStateRepository.upsert({ id: ctx.message!.chat.id, state: 'START-QNA' })
})

coolgramBot.command(commands.stopQna, ctx => {
  chatStateRepository.upsert({ id: ctx.message!.chat.id, state: 'STARTED' })
})

coolgramBot.command(commands.stopKulgram, ctx => {
  chatStateRepository.upsert({ id: ctx.message!.chat.id, state: 'STOPED' })
  const session = sessionController.getSessionById(ctx.chat!.id)
  if (session) {
    makePdf(session)
    promiseCatcher(ctx.telegram.sendDocument(ctx.chat!.id, { filename: 'recap.pdf', source: 'recap.pdf' }))
  }
})
coolgramBot.on('text', ctx => {
  const botState = chatStateRepository.findById(ctx.chat!.id)
  if (botState && botState.state === 'STARTING') {
    promiseCatcher(ctx.reply('Siapa author kulgramnya ?'))
  } else if (botState && botState.state === 'PICK-AUTHOR') {
    promiseCatcher(ctx.reply('Ok Kulgram di mulai !'))
  }
  sessionController.handle(ctx.message!)
})

promiseCatcher(coolgramBot.launch())

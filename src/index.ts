// tslint:disable-next-line: no-var-requires
require('dotenv').config()
import TelegramBot, { ContextMessageUpdate } from 'telegraf'
import { SessionController } from './controller'
import { ChatStateController } from './controller/chat-state-controller'
import { makePdf, promiseCatcher } from './utils'
const commands = {
  banUser: 'ban',
  demote: 'demote',
  promote: 'promote',
  startKulgram: 'startKulgram',
  startQna: 'startQna',
  stopKulgram: 'stopKulgram',
  stopQna: 'stopQna',
  unBan: 'unBan'
}
const coolgramBot = new TelegramBot(process.env.BOT_TOKEN!)
const sessionController = new SessionController()
const chatStateController = new ChatStateController()
coolgramBot.command(commands.banUser, ctx => {
  promiseCatcher(
    ctx.telegram.setChatPermissions(ctx.chat!.id, {
      can_add_web_page_previews: false,
      can_change_info: false,
      can_invite_users: false,
      can_pin_messages: false,
      can_send_media_messages: false,
      can_send_messages: false,
      can_send_other_messages: false,
      can_send_polls: false
    })
  )
})
coolgramBot.command(commands.unBan, ctx => {
  promiseCatcher(
    // @ts-ignore
    ctx.telegram.setChatPermissions(ctx.chat!.id, {
      can_add_web_page_previews: true,
      can_change_info: true,
      can_invite_users: true,
      can_pin_messages: true,
      can_send_media_messages: true,
      can_send_messages: true,
      can_send_other_messages: true,
      can_send_polls: true
    })
  )
})
coolgramBot.command(commands.promote, ctx => {
  promiseCatcher(
    ctx.telegram.promoteChatMember(ctx.chat!.id, 612651288, {
      can_change_info: false,
      can_delete_messages: false,
      can_edit_messages: false,
      can_invite_users: false,
      can_pin_messages: false,
      can_post_messages: true,
      can_promote_members: false,
      can_restrict_members: false
    })
  )
})

coolgramBot.command(commands.demote, ctx => {
  promiseCatcher(
    ctx.telegram.promoteChatMember(ctx.chat!.id, 612651288, {
      can_change_info: false,
      can_delete_messages: false,
      can_edit_messages: false,
      can_invite_users: false,
      can_pin_messages: false,
      can_post_messages: false,
      can_promote_members: false,
      can_restrict_members: false
    })
  )
})

coolgramBot.command(commands.startKulgram, ctx => {
  promiseCatcher(ctx.reply('Apa judul kulgram anda?'))
  chatStateController.prepareKulgram(ctx.chat!.id)
})
coolgramBot.command(commands.startQna, ctx => {
  chatStateController.startQna(ctx.chat!.id)
})

coolgramBot.command(commands.stopQna, ctx => {
  chatStateController.startKulgram(ctx.chat!.id)
})

coolgramBot.command(commands.stopKulgram, ctx => {
  chatStateController.stopKulgram(ctx.chat!.id)
  const session = sessionController.getSessionById(ctx.chat!.id)
  if (session) {
    makePdf(session)
    promiseCatcher(ctx.telegram.sendDocument(ctx.chat!.id, { filename: 'recap.pdf', source: 'recap.pdf' }))
  }
})

coolgramBot.on('text', ctx => {
  const botState = chatStateController.getCurrentState(ctx.chat!.id)
  if (botState === 'STARTING') {
    promiseCatcher(ctx.reply('Siapa author kulgramnya ?'))
  } else if (botState === 'PICK-AUTHOR') {
    promiseCatcher(ctx.reply('Ok Kulgram di mulai !'))
  }
  sessionController.handle(ctx.message!)
})

coolgramBot.catch((err: any, _ctx: ContextMessageUpdate) => {
  console.log(err)
})

promiseCatcher(coolgramBot.launch())

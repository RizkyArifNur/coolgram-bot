import { ContextMessageUpdate } from 'telegraf'
import { SessionController } from './controller'
import { ChatStateController } from './controller/chat-state-controller'
import { makePdf } from './utils'

export class Bot {
  confirmationOptions = {
    no: 'Tidak, Input ulang data!',
    yes: 'Iya Benar'
  }
  chatStateController = new ChatStateController()
  sessionController = new SessionController()
  async handleMessage(ctx: ContextMessageUpdate) {
    const botState = this.chatStateController.getCurrentState(ctx.chat!.id)
    this.sessionController.handle(ctx.message!)
    const session = this.sessionController.getActivedSession(ctx.chat!.id)!
    if (botState === 'STARTING') {
      await ctx.reply('Siapa author kulgramnya ?')
    } else if (botState === 'PICK-AUTHOR') {
      await ctx.reply(`Apa datanya sudah benar ? \n Judul Kulgram ${session.title}\n Author ${session.author}`, {
        reply_markup: {
          keyboard: [
            [
              {
                text: this.confirmationOptions.yes
              }
            ],
            [
              {
                text: this.confirmationOptions.no
              }
            ]
          ]
        }
      })

      this.chatStateController.confirmation(ctx.chat!.id)
    } else if (botState === 'CONFIRMATION') {
      switch (ctx.message!.text) {
        case this.confirmationOptions.no:
          await ctx.reply('Okay kita ulang lagi ya\nApa judul kulgram anda?', {
            reply_markup: {
              keyboard: []
            }
          })
          this.sessionController.removeActivedSession(ctx.chat!.id)
          this.chatStateController.prepareKulgram(ctx.chat!.id)
          break
        case this.confirmationOptions.yes:
          await ctx.reply('Okay Kulgram di Mulai!')
          this.chatStateController.startKulgram(ctx.chat!.id)
          break
      }
    }
  }

  async startKulgram(ctx: ContextMessageUpdate) {
    await ctx.reply('Apa judul kulgram anda?')
    this.chatStateController.prepareKulgram(ctx.chat!.id)
  }

  async stopKulgram(ctx: ContextMessageUpdate) {
    this.chatStateController.stopKulgram(ctx.chat!.id)
    const session = this.sessionController.getActivedSession(ctx.chat!.id)
    if (session) {
      await makePdf(session)
      await ctx.telegram.sendDocument(ctx.chat!.id, { filename: 'recap.pdf', source: 'recap.pdf' })
    }
  }

  async startQna(ctx: ContextMessageUpdate) {
    this.chatStateController.startQna(ctx.chat!.id)
  }

  async stopQna(ctx: ContextMessageUpdate) {
    this.chatStateController.startKulgram(ctx.chat!.id)
  }
}

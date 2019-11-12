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
    switch (botState) {
      case 'CONFIRMATION':
        await this.onMessageStateConfirmation(ctx)
        break
      case 'PICK-AUTHOR':
        await this.onMessageStatePickAuthor(ctx)
        break
      case 'START-QNA':
        await this.onMessageStateStartQna(ctx)
        break
      case 'STARTED':
        await this.onMessageStateStarted(ctx)
        break
      case 'STARTING':
        await this.onMessageStateStarting(ctx)
        break
    }
  }

  async onMessageStateConfirmation(ctx: ContextMessageUpdate) {
    switch (ctx.message!.text) {
      case this.confirmationOptions.no:
        await ctx.reply('Okay kita ulang lagi ya\nApa judul kulgram anda?')
        this.sessionController.removeActivedSession(ctx.chat!.id)
        this.chatStateController.prepareKulgram(ctx.chat!.id)
        break
      case this.confirmationOptions.yes:
        await ctx.reply(
          'Okay Kulgram di Mulai!, Hanya admin & author kulgram yang bisa mengirimkan pesan, group akan kembali normal ketika kulgram telah selesai...'
        )
        this.chatStateController.startKulgram(ctx.chat!.id)
        const permissions = this.chatStateController.getBlockedPermissions()
        await ctx.telegram.setChatPermissions(ctx.chat!.id, permissions)
        await this.promoteAuthor(ctx)
        break
    }
  }

  async onMessageStateStarted(ctx: ContextMessageUpdate) {
    this.sessionController.handleStarted(ctx.message!)
  }
  async onMessageStateStarting(ctx: ContextMessageUpdate) {
    await ctx.reply('Siapa author kulgramnya ?')
    this.sessionController.handleStarting(ctx.message!)
  }

  async onMessageStateStartQna(ctx: ContextMessageUpdate) {
    this.sessionController.handleQna(ctx.message!)
  }

  async onMessageStatePickAuthor(ctx: ContextMessageUpdate) {
    this.sessionController.handlePickAuthor(ctx.message!)
    const activedSession = this.sessionController.getActivedSession(ctx.chat!.id)
    if (!activedSession) {
      await ctx.reply(`Tidak ada sesi kulgram yang sedang aktif di group ini`)
      return
    }
    await ctx.reply(
      `Apa datanya sudah benar ? \n Judul Kulgram ${activedSession.title}\n Author ${activedSession.author}`,
      {
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
          ],
          one_time_keyboard: true,
          remove_keyboard: true
        }
      }
    )
    this.chatStateController.confirmation(ctx.chat!.id)
  }

  async startKulgram(ctx: ContextMessageUpdate) {
    await ctx.reply('Apa judul kulgram anda?')
    const chat = await ctx.getChat()
    this.chatStateController.prepareKulgram(chat.id)
    this.chatStateController.updatePermissions(chat.id, chat.permissions)
  }

  async stopKulgram(ctx: ContextMessageUpdate) {
    this.chatStateController.stopKulgram(ctx.chat!.id)
    const session = this.sessionController.getActivedSession(ctx.chat!.id)
    if (session) {
      await makePdf(session)
      await ctx.telegram.sendDocument(ctx.chat!.id, { filename: 'recap.pdf', source: 'recap.pdf' })
      const permissions = this.chatStateController.getAllowedPermissions()
      await ctx.telegram.setChatPermissions(ctx.chat!.id, permissions)
      this.chatStateController.updatePermissions(ctx.chat!.id, ctx.chat!.permissions)
      await this.demoteAuthor(ctx)
    }
  }

  async startQna(ctx: ContextMessageUpdate) {
    const permissions = this.chatStateController.getAllowedPermissions()
    await ctx.telegram.setChatPermissions(ctx.chat!.id, permissions)
    this.chatStateController.updatePermissions(ctx.chat!.id, ctx.chat!.permissions)
    this.chatStateController.startQna(ctx.chat!.id)
  }

  async stopQna(ctx: ContextMessageUpdate) {
    const permissions = this.chatStateController.getBlockedPermissions()
    await ctx.telegram.setChatPermissions(ctx.chat!.id, permissions)
    this.chatStateController.updatePermissions(ctx.chat!.id, ctx.chat!.permissions)
    this.chatStateController.startKulgram(ctx.chat!.id)
  }

  private async promoteAuthor(ctx: ContextMessageUpdate) {
    await ctx.telegram.promoteChatMember(ctx.chat!.id, this.sessionController.getActivedAuthorId(ctx.chat!.id), {
      can_change_info: false,
      can_delete_messages: false,
      can_edit_messages: false,
      can_invite_users: false,
      can_pin_messages: false,
      can_post_messages: true,
      can_promote_members: false,
      can_restrict_members: false
    })
  }

  private async demoteAuthor(ctx: ContextMessageUpdate) {
    await ctx.telegram.promoteChatMember(ctx.chat!.id, this.sessionController.getActivedAuthorId(ctx.chat!.id), {
      can_change_info: false,
      can_delete_messages: false,
      can_edit_messages: false,
      can_invite_users: false,
      can_pin_messages: false,
      can_post_messages: false,
      can_promote_members: false,
      can_restrict_members: false
    })
  }
}

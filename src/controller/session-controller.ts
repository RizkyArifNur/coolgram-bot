import { IncomingMessage } from 'telegraf/typings/telegram-types'
import { MessageNotFoundError } from '../provider/error-provider'
import { ChatStateRepository } from '../repository/chat-state-repository'
import { SessionRepository } from '../repository/session-repository'
export class SessionController {
  sessionRepository = new SessionRepository()
  chatStateRepository = new ChatStateRepository()

  endSession(id: number) {
    const msg = this.sessionRepository.getActivedSession(id)
    if (!msg) {
      throw new MessageNotFoundError('Belum ada sesi yang di mulai, mohon buat sesi kulgram baru terlebih dahulu.')
    }
    msg.dateEnd = new Date()
    this.sessionRepository.upsert(msg)
  }
  getActivedSession(id: number) {
    return this.sessionRepository.getActivedSession(id)
  }
  getActivedAuthorId(id: number) {
    const session = this.sessionRepository.getActivedSession(id)
    if (!session) {
      throw new MessageNotFoundError('Belum ada sesi yang di mulai, mohon buat sesi kulgram baru terlebih dahulu.')
    }
    return session.authorId!
  }

  removeActivedSession(id: number) {
    return this.sessionRepository.removeActivedSession(id)
  }

  handleStarting(message: IncomingMessage) {
    const chatId = message.chat.id
    this.sessionRepository.insert({
      author: '',
      dateEnd: null,
      dateStart: new Date(),
      id: message.chat.id,
      messages: [],
      title: message.text
    })
    this.chatStateRepository.updateKulgramState(chatId, 'PICK-AUTHOR')
  }

  handlePickAuthor(message: IncomingMessage) {
    const chatId = message.chat.id
    const msg = this.sessionRepository.getActivedSession(chatId)
    if (!msg) {
      throw new MessageNotFoundError('Belum ada sesi yang di mulai, mohon buat sesi kulgram baru terlebih dahulu.')
    }

    msg.author = message.reply_to_message!.from!.first_name
    msg.authorId = message.reply_to_message!.from!.id
    this.sessionRepository.update(msg.id, {
      author: msg.author,
      authorId: msg.authorId,
      dateEnd: msg.dateEnd,
      dateStart: msg.dateStart,
      messages: msg.messages,
      title: msg.title
    })
    this.chatStateRepository.updateKulgramState(chatId, 'STARTED')
  }

  handleStarted(message: IncomingMessage) {
    this.handleRecordedMessage(message, false)
  }

  handleQna(message: IncomingMessage) {
    this.handleRecordedMessage(message, true)
  }

  private handleRecordedMessage(message: IncomingMessage, isQna: boolean) {
    const chatId = message.chat.id
    const chatAlreadyRecorded = this.sessionRepository.getActivedSession(chatId)
    if (chatAlreadyRecorded) {
      this.sessionRepository.insertNewMessage(chatId, {
        firstName: message.from!.first_name,
        isQna,
        lastName: message.from!.last_name || '',
        message: message.text!
      })
    } else {
      this.sessionRepository.insert({
        dateEnd: null,
        dateStart: new Date(),
        id: message.chat.id,
        messages: [
          {
            firstName: message.from!.first_name,
            isQna,
            lastName: message.from!.last_name || '',
            message: message.text!
          }
        ]
      })
    }
  }
}

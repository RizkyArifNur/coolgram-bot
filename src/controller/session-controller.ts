import { IncomingMessage } from 'telegraf/typings/telegram-types'
import { ChatStateRepository } from '../repository/chat-state-repository'
import { SessionRepository } from '../repository/session-repository'
export class SessionController {
  sessionRepository = new SessionRepository()
  chatStateRepository = new ChatStateRepository()

  getActivedSession(id: number) {
    return this.sessionRepository.getActivedSession(id)
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
      throw new Error('Something went wrong') // TODO: Please fix this
    }
    console.log('message is !!!', message)

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

  handle(message: IncomingMessage) {
    let isQna = false
    const chatId = message.chat.id
    const state = this.chatStateRepository.findById(chatId)

    if (state) {
      if (state.state === 'STARTING') {
        this.sessionRepository.insert({
          author: '',
          dateEnd: null,
          dateStart: new Date(),
          id: message.chat.id,
          messages: [],
          title: message.text
        })
        this.chatStateRepository.updateKulgramState(chatId, 'PICK-AUTHOR')
        return
      } else if (state.state === 'PICK-AUTHOR') {
        const msg = this.sessionRepository.getActivedSession(chatId)
        if (!msg) {
          throw new Error('Something went wrong') // TODO: Please fix this
        }
        console.log('message is !!!', message)

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
        return
      } else if (state.state !== 'CONFIRMATION') {
        isQna = state.state === 'START-QNA'

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

import { IncomingMessage } from 'telegraf/typings/telegram-types'
import { ChatStateRepository } from '../repository/chat-state-repository'
import { MessageRepository } from '../repository/message-repository'
export class SessionController {
  messageRepository = new MessageRepository()
  chatStateRepository: ChatStateRepository
  constructor(chatStateRepository: ChatStateRepository) {
    this.chatStateRepository = chatStateRepository
  }
  getSessionById(id: number) {
    return this.messageRepository.findById(id)
  }
  handle(message: IncomingMessage) {
    let isQna = false
    const chatId = message.chat.id
    const state = this.chatStateRepository.findById(chatId)

    if (state) {
      if (state.state === 'STARTING') {
        this.messageRepository.insert({
          author: '',
          data: [],
          dateEnd: null,
          dateStart: new Date(),
          id: message.chat.id,
          title: message.text
        })
        this.chatStateRepository.update(chatId, {
          state: 'PICK-AUTHOR'
        })
        return
      } else if (state.state === 'PICK-AUTHOR') {
        const msg = this.messageRepository.findById(chatId)
        if (!msg) {
          throw new Error('Something went wrong') // TODO: Please fix this
        }
        msg.author = message.text
        this.messageRepository.update(msg.id, {
          author: msg.author,
          data: msg.data,
          dateEnd: msg.dateEnd,
          dateStart: msg.dateStart,
          title: msg.title
        })
        this.chatStateRepository.update(chatId, {
          state: 'STARTED'
        })
        return
      }
      isQna = state.state === 'START-QNA'

      const chatAlreadyRecorded = this.messageRepository.findById(chatId)
      if (chatAlreadyRecorded) {
        this.messageRepository.insertNewMessage(chatId, {
          firstName: message.from!.first_name,
          isQna,
          lastName: message.from!.last_name || '',
          message: message.text!
        })
      } else {
        this.messageRepository.insert({
          data: [
            {
              firstName: message.from!.first_name,
              isQna,
              lastName: message.from!.last_name || '',
              message: message.text!
            }
          ],
          dateEnd: null,
          dateStart: new Date(),
          id: message.chat.id
        })
      }
    }
  }
}

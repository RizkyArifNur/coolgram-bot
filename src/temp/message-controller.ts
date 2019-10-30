import { existsSync, readFileSync, writeFileSync } from 'fs'
import { IncomingMessage } from 'telegraf/typings/telegram-types'
import { IRecordedMessages } from '../typings'
import { StateController } from './state-controller'
export class MessageController {
  static read(chatId: number | string): IRecordedMessages | undefined {
    return (JSON.parse(readFileSync(this.messagePath).toString()) as IRecordedMessages[]).find(
      rm => rm.chatId === chatId
    )
  }
  static handle(message: IncomingMessage) {
    this.ensureFileExists()
    let isQna = false
    const state = StateController.readState().find(s => s.chatId === message.chat.id)

    if (state) {
      const recordedMessage = this.readRecordedMessage()
      if (state.state === 'STARTING') {
        recordedMessage.push({
          author: '',
          chatId: message.chat.id,
          data: [],
          dateStart: new Date(),
          title: message.text
        })
        StateController.setState(message.chat.id, 'PICK-AUTHOR')
        this.writeRecordedMessage(recordedMessage)
        return
      } else if (state.state === 'PICK-AUTHOR') {
        const msg = recordedMessage.find(rm => rm.chatId === message.chat.id)!
        msg.author = message.text
        StateController.setState(message.chat.id, 'STARTED')
        this.writeRecordedMessage(recordedMessage)
        return
      }
      isQna = state.state === 'START-QNA'
      const chatAlreadyRecorded = recordedMessage.find(rm => rm.chatId === message.chat.id)
      if (chatAlreadyRecorded) {
        chatAlreadyRecorded.data.push({
          firstName: message.from!.first_name,
          isQna,
          lastName: message.from!.last_name || '',
          message: message.text!
        })
      } else {
        recordedMessage.push({
          chatId: message.chat.id,
          data: [
            {
              firstName: message.from!.first_name,
              isQna,
              lastName: message.from!.last_name || '',
              message: message.text!
            }
          ],
          dateStart: new Date()
        })
      }
      this.writeRecordedMessage(recordedMessage)
    }
  }
  private static messagePath = process.env.MESSAGE_RECORDED_PATH!
  private static writeRecordedMessage(message: IRecordedMessages[]) {
    writeFileSync(this.messagePath, JSON.stringify(message))
  }
  private static readRecordedMessage(): IRecordedMessages[] {
    return JSON.parse(readFileSync(this.messagePath).toString())
  }
  private static ensureFileExists() {
    /**
     * check if message already exists
     */
    if (!existsSync(this.messagePath)) {
      /**
       * if message not found then create it
       */
      writeFileSync(this.messagePath, '[]')
    }
  }
}

import { existsSync, readFileSync, writeFileSync } from 'fs'
import { IncomingMessage } from 'telegraf/typings/telegram-types'
import { IRecordedMessages } from '../typings'
import { StateController } from './state-controller'
export class MessageController {
  static handleMessage(message: IncomingMessage) {
    this.ensureFileExists()
    const state = StateController.readState().find(s => s.chatId === message.chat.id)
    if (state) {
      this.handle(message, state.state === 'START-QNA')
    }
  }

  private static messagePath = process.env.MESSAGE_RECORDED_PATH!
  private static handle(message: IncomingMessage, isQna: boolean) {
    const recordedMessage = this.readRecordedMessage()
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

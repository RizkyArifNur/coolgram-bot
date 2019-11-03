// tslint:disable: max-classes-per-file
import { ErrorCode } from '../typings'

export class ErrorProvider {
  code: ErrorCode
  message: string
  name = 'CoolgramErr'
  constructor() {
    Error.captureStackTrace(this, ErrorProvider)
  }
}

export class MessageNotFoundError extends ErrorProvider {
  constructor(message: string) {
    super()
    this.code = 'MESSAGE_NOT_FOUND'
    this.message = message
  }
}

export class ChatStateNotFoundError extends ErrorProvider {
  constructor(message: string) {
    super()
    this.code = 'CHAT_STATE_NOT_FOUND'
    this.message = message
  }
}

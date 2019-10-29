export interface IMessage {
  firstName: string
  lastName: string
  message: string
  isQna: boolean
}

export type KulgramState = 'STOPED' | 'STARTED' | 'START-QNA'

export interface IState {
  chatId: number
  state: KulgramState
}

export interface IRecordedMessages {
  chatId: number
  title: string
  author: string
  dateStart: Date
  dateEnd: Date
  data: IMessage[]
}

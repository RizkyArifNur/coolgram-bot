import 'telegraf'
import { IAdminChatPermissions, IChatPermissions } from './'

declare module 'telegraf' {
  // tslint:disable: interface-name
  export interface Telegram {
    setChatPermissions: (chatId: string | number, permissions: IChatPermissions) => Promise<boolean>
    promoteChatMember: (
      chatId: string | number,
      userId: string | number,
      permissions: IAdminChatPermissions
    ) => Promise<boolean>
  }
}

declare module 'telegram-typings' {
  export interface Chat {
    permissions: IChatPermissions
  }
}

import { existsSync, readFileSync, writeFileSync } from 'fs'
import { IState, KulgramState } from '../typings'

export class StateController {
  static setState(chatId: number, state: KulgramState): IState[] {
    this.ensureFileExists()
    /**
     * read state
     */
    const currentState: IState[] = JSON.parse(readFileSync(this.statePath).toString())
    const stateFound = currentState.find(c => c.chatId === chatId)
    if (stateFound) {
      stateFound.state = state
    } else {
      currentState.push({ chatId, state })
    }

    /**
     * rewrite the state
     */
    writeFileSync(this.statePath, JSON.stringify(currentState))
    return currentState
  }

  static readState(): IState[] {
    this.ensureFileExists()
    return JSON.parse(readFileSync(this.statePath).toString()) as IState[]
  }
  private static statePath = process.env.STATE_PATH!
  private static ensureFileExists() {
    /**
     * check if state already exists
     */
    if (!existsSync(this.statePath)) {
      /**
       * if state not found then create it
       */
      writeFileSync(this.statePath, '[]')
    }
  }
}

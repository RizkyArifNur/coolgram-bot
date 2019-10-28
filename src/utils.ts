import { IMessage } from './typings'

export function makePdf(_data: IMessage[]) {
  //
}

export function promiseCatcher(promise: Promise<any>) {
  promise
    .then(msg => {
      console.log(`Promise Catcher OK:`, msg)
    })
    .catch(err => {
      console.log(`Something went wrong`, err)
    })
}

import { createWriteStream } from 'fs'
import PdfPrinter from 'pdfmake'
import { IRecordedMessages } from './typings'

const fonts = {
  Roboto: {
    bold: 'src/assets/fonts/Roboto/Roboto-Medium.ttf',
    bolditalics: 'src/assets/fonts/Roboto/Roboto-MediumItalic.ttf',
    italics: 'src/assets/fonts/Roboto/Roboto-Italic.ttf',
    normal: 'src/assets/fonts/Roboto/Roboto-Regular.ttf'
  }
}
const printer = new PdfPrinter(fonts)

export function makePdf(message: IRecordedMessages) {
  const chatData = message.data
  const content = []
  let noQna = 1
  for (let i = 0; i < message.data.length; i++) {
    if (i > 0 && chatData[i].isQna === true && chatData[i - 1].isQna === false) {
      content.push({
        style: 'qna',
        text: `QnA ${noQna}`
      })
      noQna += 1
    }
    if (chatData[i].isQna === true) {
      content.push({
        style: 'qnaContent',
        text: `${chatData[i].firstName} : "${chatData[i].message}"`
      })
    } else {
      content.push({
        style: 'content',
        text: `${chatData[i].message}`
      })
    }
  }

  const docDefinition = {
    content: [
      {
        style: 'header',
        text: `${message.title}`
      },
      {
        style: 'subheader',
        text: `Oleh : ${message.author}`
      },
      {
        style: 'subheader',
        text: getDateIndonesia(String(message.dateStart))
      },
      ...content
    ],
    styles: {
      content: {
        alignment: 'justify',
        fontSize: 14,
        margin: [0, 16, 0, 0]
      },
      header: {
        alignment: 'center',
        fontSize: 28,
        margin: [0, 5]
      },
      qna: {
        fontSize: 28,
        margin: [0, 30, 0, 10]
      },
      qnaContent: {
        alignment: 'left',
        fontSize: 14,
        margin: [0, 8, 0, 0]
      },
      subheader: {
        alignment: 'center',
        fontSize: 15,
        margin: [0, 2]
      }
    }
  }
  const options = {}
  const pdfDoc = printer.createPdfKitDocument(docDefinition, options)
  pdfDoc.pipe(createWriteStream('recap.pdf'))
  pdfDoc.end()
}

function getDateIndonesia(date: string): string {
  enum monthIndo {
    'Januari' = 1,
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember'
  }
  const dates = date.substring(0, 10).split('-')
  const day = dates[2]
  const month = monthIndo[dates[1]]
  const year = dates[0]
  return `${day} ${month} ${year}`
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

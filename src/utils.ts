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

export function makePdf(data: IRecordedMessages) {
  const dataChat = data.data
  const content = []
  let noQna = 1
  for (let i = 0; i < data.data.length; i++) {
    if (i > 0 && dataChat[i].isQna === true && dataChat[i - 1].isQna === false) {
      content.push({
        text: `QnA ${noQna}`,
        style: 'qna'
      })
      noQna += 1
    }
    if (dataChat[i].isQna === true) {
      content.push({
        text: `${dataChat[i].firstName} : "${dataChat[i].message}"`,
        style: 'qnaContent'
      })
    } else {
      content.push({
        text: `${dataChat[i].message}`,
        style: 'content'
      })
    }
  }

  const docDefinition = {
    content: [
      {
        text: `${data.title}`,
        style: 'header'
      },
      {
        text: `Oleh : ${data.author}`,
        style: 'subheader'
      },
      {
        text: getDateIndonesia(String(data.dateStart)),
        style: 'subheader'
      },
      ...content
    ],
    styles: {
      header: {
        alignment: 'center',
        fontSize: 28,
        margin: [0, 5]
      },
      subheader: {
        alignment: 'center',
        fontSize: 15,
        margin: [0, 2]
      },
      content: {
        alignment: 'justify',
        fontSize: 14,
        margin: [0, 16, 0, 0]
      },
      qnaContent: {
        alignment: 'left',
        fontSize: 14,
        margin: [0, 8, 0, 0]
      },
      qna: {
        fontSize: 28,
        margin: [0, 30, 0, 10]
      }
    }
  }
  const options = {}
  const pdfDoc = printer.createPdfKitDocument(docDefinition, options)
  pdfDoc.pipe(createWriteStream('recap.pdf'))
  pdfDoc.end()
}

function getDateIndonesia(tgl: string): string {
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
  const arrTgl = tgl.substring(0, 10).split('-')
  const day = arrTgl[2]
  const month = monthIndo[arrTgl[1]]
  const year = arrTgl[0]
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

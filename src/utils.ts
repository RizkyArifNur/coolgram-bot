import { createWriteStream } from 'fs'
// @ts-ignore
import PdfPrinter from 'pdfmake'
import { ISession } from './typings'

const fonts = {
  Roboto: {
    bold: 'src/assets/fonts/Roboto/Roboto-Medium.ttf',
    bolditalics: 'src/assets/fonts/Roboto/Roboto-MediumItalic.ttf',
    italics: 'src/assets/fonts/Roboto/Roboto-Italic.ttf',
    normal: 'src/assets/fonts/Roboto/Roboto-Regular.ttf'
  }
}
const printer = new PdfPrinter(fonts)

export function makePdf(message: ISession) {
  return new Promise((resolve, reject) => {
    try {
      const chatData = message.data
      const content = []
      let noQna = 1
      let contentKulgram = []
      for (let i = 0; i < message.data.length; i++) {
        if (i > 0 && chatData[i].isQna === true && chatData[i - 1].isQna === false) {
          content.push({
            style: 'content',
            text: contentKulgram
          })
          content.push({
            style: 'qna',
            text: `QnA ${noQna}`
          })
          noQna += 1
          contentKulgram = []
        } else if (i > 0 && chatData[i].isQna === false && chatData[i - 1].isQna === true) {
          content.push({
            style: 'br',
            text: ''
          })
        }

        if (i === message.data.length - 1) {
          content.push({
            style: 'content',
            text: contentKulgram
          })
        }

        if (chatData[i].isQna === true) {
          content.push({
            style: 'qnaContent',
            text: `${chatData[i].firstName} : "${chatData[i].message}"`
          })
        } else {
          contentKulgram.push(`${chatData[i].message} `)
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
            style: 'date',
            text: getDateIndonesia(String(message.dateStart))
          },
          ...content
        ],
        styles: {
          br: {
            margin: [0, 10]
          },
          content: {
            alignment: 'justify',
            fontSize: 14,
            margin: [0, 8, 0, 0]
          },
          date: {
            alignment: 'center',
            fontSize: 15,
            margin: [0, 2, 0, 10]
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
      let pdf
      const options = {}
      const pdfDoc = printer.createPdfKitDocument(docDefinition, options)
      pdfDoc.pipe((pdf = createWriteStream('recap.pdf')))
      pdfDoc.end()
      pdf.on('finish', async () => {
        resolve('PDF has created')
      })
    } catch (err) {
      reject(err)
    }
  })
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

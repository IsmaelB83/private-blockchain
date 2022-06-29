import fs from 'fs'

export function encodeHex(pathToFile) {
    const imgBuffer = fs.readFileSync(pathToFile)
    const imgEncoded = new Buffer.from(imgBuffer).toString('hex')
    console.log(imgEncoded)
}

export function encodeHexToFile(pathToFile, encodedFile) {
    const imgBuffer = fs.readFileSync(pathToFile)
    const imgEncoded = new Buffer.from(imgBuffer).toString('hex')
    fs.writeFileSync(encodedFile, imgEncoded)
}

export function decodeHexToFile(pathToFile, decodedFile) {
    const imgBuffer = fs.readFileSync(pathToFile)
    const imgDecoded = new Buffer.from(imgBuffer, 'hex')
    fs.writeFileSync(decodedFile, imgDecoded)
}
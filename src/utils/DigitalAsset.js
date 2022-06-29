import fs from 'fs'

export function encodeHex(pathToFile) {
    const imgBuffer = fs.readFileSync(pathToFile)
    const imgEncoded = new Buffer.from(imgBuffer).toString('hex')
    return imgEncoded
}

export function decodeHexToFile(imgEncoded, decodedFile) {
    const imgDecoded = new Buffer.from(imgEncoded, 'hex')
    fs.writeFileSync(decodedFile, imgDecoded)
}
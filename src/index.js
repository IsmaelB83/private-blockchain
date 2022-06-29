import Block from './blockchain/Block.js';
import BlockChain from './blockchain/BlockChain.js';

const aux = new BlockChain();
aux.addBlock(new Block("Second block"));
aux.addBlock(new Block("Third block"));

import { encodeHex, decodeHexToFile } from './utils/DigitalAsset.js';
import path from "path"

const encoded = encodeHex(path.join(path.resolve(),'assets/image.jpeg'))
console.log(encoded);
decodeHexToFile(encoded, path.join(path.resolve(),'assets/imageDecoded.jpeg'))

import Block from './blockchain/Block.js';
import BlockChain from './blockchain/BlockChain.js';

const aux = new BlockChain();
aux.addBlock(new Block("Second block"));
aux.addBlock(new Block("Third block"));

import { encodeHex } from './utils/DigitalAsset.js';
import path from "path"

encodeHex(path.join(path.resolve(),'assets/image.jpeg'))

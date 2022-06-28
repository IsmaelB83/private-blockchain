import Block from './Block.js';
import BlockChain from './BlockChain.js';

const aux = new BlockChain();
aux.addBlock(new Block("Second block"));
aux.addBlock(new Block("Third block"));
console.log(aux);
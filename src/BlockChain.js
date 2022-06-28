// Node imports
import sha256 from "crypto-js/sha256.js"
// Own imports
import Block from './Block.js'

/**
 * Main class that handles our simple private blockchain. 
 * Should support following methods:
 *  - createGenesisBlock()
 *  - getLatestBlock()  
 *  - addBlock()
 *  - getBlock()
 *  - validateBlock()
 *  - validateChain() 
 */
export default class BlockChain {

    constructor() {
        this.chain = []
        this.createGenesisBlock()
    }

    createGenesisBlock() {
        const genesisBlock = new Block("First block in the chain - Genesis block");
        genesisBlock.hash = sha256(JSON.stringify(genesisBlock)).toString()
        this.chain.push(genesisBlock)
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock (newBlock) {
        newBlock.hash = sha256(JSON.stringify(newBlock)).toString()
        newBlock.height = this.chain.length;
        newBlock.timeStamp = new Date().getTime().toString().slice(0,-3)
        if (this.chain.length) {
            newBlock.previousHash = this.getLatestBlock().hash
        }
        this.chain.push(newBlock)
    }
}
// Node imports
const sha256 = require('crypto-js/sha256.js');
const hex2ascii = require('hex2ascii');
// Own imports
const { DIFFICULTY, MINE_RATE } = require('../config');

/**
*  -------------------------------------------------------------------------
*  BLOCK CLASS
*  -------------------------------------------------------------------------
*  Description: 
*  The Block class is a main component into any Blockchain platform, 
*  it will store the data and act as a dataset for your application.
*  The class will expose a method to validate the data... The body of
*  the block will contain an Object that contain the data to be stored,
*  the data should be stored encoded.
*  -------------------------------------------------------------------------
*  Notes:
*  All the exposed methods should return a Promise to allow all the methods 
*  run asynchronous.
*  -------------------------------------------------------------------------
*  Methods:
*   - validate() --> returns a promise that resolves with True if block hash is valid
*   - getBodyData() --> returns a promise that resolves with JSON block body (unless genesis block)
*/
module.exports = class Block {
    
    /**
    * Constructor of a new block.
    * @param {Block} previousBlock Previous block in the chain
    * @param {Date} timeStamp Block timestamp creation
    * @param {String} hash Hash of the block
    * @param {Object} data Block body
    * @param {Number} nonce Nonce (PoW)
    * @param {Number} difficulty Leading zeros required for the hash
    */
    constructor(previousBlock, timeStamp, hash, data, nonce, difficulty, timeMining) {
        // Nonce
        this.nonce = nonce;
        // Hash of the block
        this.hash = hash;
        // Timestamp for the Block creation
        this.timeStamp = timeStamp;
        // Will contain the encoded transactions stored in the block
        this.body = Buffer.from(JSON.stringify(data)).toString('hex'); 
        // Block Height (consecutive number of each block)
        this.height = previousBlock ? previousBlock.height + 1 : 0; 
        // Reference to the previous Block Hash
        this.previousHash = previousBlock ? previousBlock.hash : null;
        // Difficulty
        this.difficulty = difficulty || DIFFICULTY;
        // Time mining
        this.timeMining = timeMining;
    }
    
    /**
    * Creates genesis block
    */
    static genesis() {
        const hash =  Block.hash(0, null, 'Genesis block', 0);
        return new this(null, 0, hash, 'Genesis block', 0, 0, 0);
    }
    
    /**
    * This method returns a promise that resolves to true when the block is mined
    */
    static mine(previousBlock, data) {
        return new Promise((resolve) => {
            // Data that will belong to the block header
            let difficulty = previousBlock.timeStamp ? previousBlock.difficulty : DIFFICULTY;
            let nonce = -1;
            let timeStamp = 0;
            let hash = '';
            let timeMining = Date.now();
            // Mining until hash fulfill with current network difficulty (PoW)
            do {
                nonce++;
                timeStamp = Date.now();
                difficulty = Block.adjustDifficulty(previousBlock, timeStamp);
                hash = Block.hash(timeStamp, previousBlock.hash, data, nonce)
            } while(hash.substring(0, difficulty) !== '0'.repeat(difficulty));
            const block = new this(previousBlock, timeStamp, hash, data, nonce, difficulty, Date.now() - timeMining);
            resolve(block)
        })
    }
    
    /**
    * This method only calculates the sha256
    * @param {String} timeStamp 
    * @param {String} previousHash 
    * @param {Object} body 
    * @returns String with the sha256 of the block
    */
    static hash(timeStamp, previousHash, body, nonce) {
        return sha256(`${timeStamp}${previousHash}${JSON.stringify(body)}${nonce}`).toString()
    } 
    
    /**
    * Utility function to adjust difficulty
    */
    static adjustDifficulty(previousBlock, currentTime) {
        // Local variables
        let difficulty = previousBlock.difficulty;
        let lapse = previousBlock.timeStamp + MINE_RATE
        // If time from last block mining + MINE_RATE in milisec is higher than current time difficulty will be previousBlock + 1. Otherwise decrease.
        difficulty = lapse > currentTime ? difficulty + 1 : difficulty - 1; 
        return difficulty; 
    }
    
    /**
    *  validate() method will validate if the block has been tampered or not.
    *  Been tampered means that someone from outside the application tried to change
    *  values in the block data as a consecuence the hash of the block should be different.
    *  Steps:
    *  1. Return a new promise to allow the method be called asynchronous.
    *  2. Save the in auxiliary variable the current hash of the block (`this` represent the block object)
    *  3. Recalculate the hash of the entire block (Use SHA256 from crypto-js library)
    *  4. Compare if the auxiliary hash value is different from the calculated one.
    *  5. Resolve true or false depending if it is valid or not.
    *  Note: to access the class values inside a Promise code you need to create an auxiliary value `let self = this;`
    */
    validate() {
        const self = this;
        return new Promise((resolve) => {
            // Recalculate hash
            const oldHash = self.hash;
            const body = self.getBodyData();
            const currentHash = Block.hash(self.timeStamp, self.previousHash, body, self.nonce);
            // Resolve/reject promise
            if (oldHash !== currentHash) 
                return resolve(false)
            resolve(true)
        });
    }

    /**
    *  Auxiliary Method to return the block body (decoding the data)
    *  Steps:
    *  1. Use hex2ascii module to decode the data
    *  2. Because data is a javascript object use JSON.parse(string) to get the Javascript Object
    *  3. Resolve with the data and make sure that you don't need to return the data for the `genesis block` 
    *     or Reject with an error.
    */
    getBodyData() {
        const decoded = hex2ascii(this.body);
        return JSON.parse(decoded);
    }
    
    /**
    * Return string representation of the block
    * @returns String
    */
    toString(){
        const body = this.getBodyData()
        return `
            [BLOCK ${this.height}]  
            TimeStamp    : ${this.timeStamp}
            PreviousHash : ${this.previousHash}
            Hash         : ${this.hash}
            Body         : ${JSON.stringify(body)}
        `;
    }
}
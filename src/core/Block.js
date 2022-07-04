// Node imports
const sha256 = require('crypto-js/sha256.js');
const hex2ascii = require('hex2ascii');

const DIFFICULTY = 4;

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
*   - getBData() --> returns a promise that resolves with JSON block body (unless genesis block)
*/
module.exports = class Block {
    
    /**
    * Constructor of a new block.
    * @param {Block} Previous block
    * @param {*} data Block body
    */
    constructor(previousBlock, data) {
        // Nonce
        this.nonce = 0;
        // Hash of the block
        this.hash = null;
        // Timestamp for the Block creation
        this.timeStamp = new Date().getTime().toString().slice(0,-3);
        // Will contain the encoded transactions stored in the block
        this.body = Buffer.from(JSON.stringify(data)).toString('hex'); 
        // Block Height (consecutive number of each block)
        this.height = previousBlock ? previousBlock.height + 1 : 0; 
        // Reference to the previous Block Hash
        this.previousHash = previousBlock ? previousBlock.hash : null;
    }
    
    /**
     * Creates genesis block
     */
    static GenesisBlock() {
        const block = new this(null, 'Genesis block');
        block.hash = Block.hash(block.timeStamp, '', block.body);
        return block;
    }

    /**
     * This method returns a promise that resolves to true when the block is mined
     */
    static mine(previousBlock, data) {
        return new Promise((resolve) => {
            // Create new block
            const block = new Block(previousBlock, data)
            // Mining until hash fulfill with current network difficulty (PoW)
            do {
                block.nonce++;
                block.hash = Block.hash(block.timeStamp, block.previousHash, block.body, block.nonce)
                console.log(`${block.hash} - ${block.nonce}`);
            } while(block.hash.substring(0, DIFFICULTY) !== '0'.repeat(DIFFICULTY));
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
    static validate(block) {
        return new Promise((resolve, reject) => {
            // Recalculate hash
            const oldHash = block.hash;
            const currentHash = sha256(JSON.stringify(block)).toString();
            // Resolve/reject promise
            if (oldHash !== currentHash) 
                reject(`Block hash ${oldHash} differs from calculated hash ${currentHash}`)
            return resolve(true)
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
    getBData() {
        let self = this;
        return new Promise((resolve, reject) => {
            try {
                const decoded = hex2ascii(self.body);
                resolve(JSON.parse(decoded));     
            } catch (error) {
                reject(error)
            }
        });
    }

    /**
     * Return string representation of the block
     * @returns String
     */
    toString(){
        const self = this;
        this.getBData()
        .then(result => {
            return `
                BLOCK ${self.height} - 
                \nTimestamp : ${self.timestamp}
                \nLast Hash : ${self.lastHash}
                \nHash      : ${self.hash}
                \nData      : ${JSON.stringify(result)}
            `;
        }) 
    }
}
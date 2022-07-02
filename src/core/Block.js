// Node imports
const sha256 = require('crypto-js/sha256.js');
const hex2ascii = require('hex2ascii');

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
    * @param {*} data Block body
    */
    constructor(data) {
        // Hash of the block
        this.hash = null;
        // Block Height (consecutive number of each block)
        this.height = 0;
        // Timestamp for the Block creation
        this.timeStamp = new Date().getTime().toString().slice(0,-3);
        // Will contain the encoded transactions stored in the block
        this.body = Buffer.from(JSON.stringify(data)).toString('hex');  
        // Reference to the previous Block Hash
        this.previousHash = null;
    }
    
    /**
     * This method returns a promise that resolves to true when hash value is calculated
     */
    mine() {
        let self = this;
        return new Promise((resolve) => {
            self.hash = sha256(self.timeStamp, self.previousHash, self.body).toString()
            resolve(true)
        })
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
        let self = this;
        return new Promise((resolve, reject) => {
            // Recalculate hash
            const oldHash = self.hash;
            const currentHash = sha256(JSON.stringify(self)).toString();
            // Resolve/reject promise
            if (oldHash === currentHash) {
                resolve(true);
                return;
            }
            reject(false)
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
}
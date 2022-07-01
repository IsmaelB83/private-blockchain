// Node imports
const sha256 = require('crypto-js/sha256.js');
const bitcoinMessage = require('bitcoinjs-message');
// Own imports
const Block = require('./Block.js');

/**
*  -------------------------------------------------------------------------
*  BLOCKCHAIN CLASS
*  -------------------------------------------------------------------------
*  Main class that handles our simple private blockchain. 
*  -------------------------------------------------------------------------
*  Methods:
*   - createGenesisBlock()
*   - getLatestBlock()  
*   - addBlock()
*   - getBlock()
*   - validateBlock()
*   - validateChain() 
*/
module.exports = class Blockchain {
    
    /**
    * Constructor of the class, you will need to setup your chain array and the height
    * of your chain (the length of your chain array).
    * Also everytime you create a Blockchain class you will need to initialized the chain creating
    * the Genesis Block.
    * The methods in this class will always return a Promise to allow client applications or
    * other backends to call asynchronous functions.
    */
    constructor() {
        this.chain = [];
        this.height = -1;
        this.initializeChain();
    }
    
    /**
    * This method will check for the height of the chain and if there isn't a Genesis Block it will create it.
    * You should use the `addBlock(block)` to create the Genesis Block
    * Passing as a data `{data: 'Genesis Block'}`
    */
    async initializeChain() {
        if( this.height === -1){
            const block = new Block('Genesis Block');
            await this._addBlock(block);
        }
    }
    
    /**
     * Utility method to obtain the chain length in blocks
     * @returns promise that resolves with the chain height
     */
    getChainHeight() {
        return new Promise((resolve) => {
            resolve(this.height);
        });
    }
    
    /**
    * _addBlock(block) will store a block in the chain
    * @param {*} block 
    * The method will return a Promise that will resolve with the block added
    * or reject if an error happen during the execution.
    * You will need to check for the height to assign the `previousBlockHash`,
    * assign the `timestamp` and the correct `height`...At the end you need to 
    * create the `block hash` and push the block into the chain array. Don't forget 
    * to update the `this.height`
    * Note: the symbol `_` in the method name indicates in the javascript convention 
    * that this method is a private method. 
    */
    _addBlock (block) {
        let self = this;
        return new Promise(async (resolve, reject) => {
            try {
                // Height 
                const height = self.height + 1;
                // Block header
                block.height = height;
                block.timeStamp = new Date().getTime().toString().slice(0,-3)
                if (height > 0) {
                    block.previousHash = self.chain[self.height].hash
                }
                block.hash = sha256(JSON.stringify(block)).toString()
                // Add to the chain and update chain height
                self.chain.push(block)
                self.height = height;
                // Resolve promise
                resolve(block)
            } catch (error) {
                // Reject promise
                reject(error)  
            }
        });
    }
    
    /**
    * The requestMessageOwnershipVerification(address) method
    * will allow you  to request a message that you will use to
    * sign it with your Bitcoin Wallet (Electrum or Bitcoin Core)
    * This is the first step before submit your Block.
    * The method return a Promise that will resolve with the message to be signed
    * @param {*} address 
    */
    requestMessageOwnershipVerification(address) {
        return new Promise((resolve) => {
            resolve(`${address}:${new Date().getTime().toString().slice(0,-3)}:starRegistry`)
        });
    }
    
    /**
    * The submitStar(address, message, signature, star) method
    * will allow users to register a new Block with the star object into the chain.
    * This method will resolve with the Block added or reject with an error.
    * Algorithm steps:
    * 1. Get the time from the message sent as a parameter example: `parseInt(message.split(':')[1])`
    * 2. Get the current time: `let currentTime = parseInt(new Date().getTime().toString().slice(0, -3));`
    * 3. Check if the time elapsed is less than 5 minutes
    * 4. Veify the message with wallet address and signature: `bitcoinMessage.verify(message, address, signature)`
    * 5. Create the block and add it to the chain
    * 6. Resolve with the block added.
    * @param {*} address 
    * @param {*} message 
    * @param {*} signature 
    * @param {*} star 
    */
    submitStar(address, message, signature, star) {
        let self = this;
        return new Promise(async (resolve, reject) => {
            try {
                const messageTime = parseInt(message.split(':')[1]);
                const currentTime = parseInt(new Date().getTime().toString().slice(0, -3));
                // Message timeout ?
                if ((currentTime-messageTime)/60 > 50) {
                    reject('Timeout')
                } else {
                    // Wrong signature ?
                    if (!bitcoinMessage.verify(message, address, signature)) {
                        reject('Wrong signature')
                    } else {
                        // Add block and resolve/reject promise
                        self._addBlock(new Block({
                            "owner": address,
                            ...star
                        }))
                        .then(result => resolve(result))
                        .catch(error => reject(error))
                    }
                }
            } catch (error) {
                console.log(error);
                reject(error)
            }
        });
    }
    
    /**
    * This method will return a Promise that will resolve with the Block
    *  with the hash passed as a parameter.
    * Search on the chain array for the block that has the hash.
    * @param {*} hash 
    */
    getBlockByHash(hash) {
        let self = this;
        return new Promise((resolve) => {
            const block = self.chain.filter(p => p.hash === hash)[0];
            if(block){
                resolve(block);
            } else {
                resolve(null);
            }
        });
    }
    
   /**
    * This method will return a Promise that will resolve with the Block object 
    * with the height equal to the parameter `height`
    * @param {*} height 
    */
    getBlockByHeight(height) {
        let self = this;
        return new Promise((resolve) => {
            const block = self.chain.filter(p => p.height === height)[0];
            if(block){
                resolve(block);
            } else {
                resolve(null);
            }
        });
    }
    
    /**
    * This method will return a Promise that will resolve with an array of Stars objects existing in the chain 
    * and are belongs to the owner with the wallet address passed as parameter.
    * Remember the star should be returned decoded.
    * @param {*} address 
    */
    getStarsByWalletAddress (address) {
        let self = this;
        let stars = [];
        return new Promise((resolve, reject) => {
            try {
                self.chain.forEach(block => {
                    block.getBData()
                    .then(body => {
                        if (body.owner === address) stars.push(body)
                    })
                    .catch(error => console.log(error));
                });
                resolve(stars)
            } catch (error) {
                console.log(error)
                reject(error)
            }
        });
    }
    
    /**
    * This method will return a Promise that will resolve with the list of errors when validating the chain.
    * Steps to validate:
    * 1. You should validate each block using `validateBlock`
    * 2. Each Block should check the with the previousBlockHash
    */
    validateChain() {
        let self = this;
        let errorLog = [];
        return new Promise(async (resolve, reject) => {
            const previousHash = self.chain[0].hash
            self.chain.forEach(block => {
                if (block.previousHash !== null && block.previousHash !== previousHash)
                    errorLog.push(`Block ${block.hash} previousHash wrong`);
                if (!block.validate) 
                    errorLog.push(`Block ${block.hash} tampered`);
                previousHash = block.hash;
            });
            resolve(errorLog)
        });
    }
}
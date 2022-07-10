// Node imports
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
*   - _createGenesisBlock()
*   - _addBlock()
*   - getChainHeight()
*   - requestMessageOwnershipVerification()
*   - submitBlock()
*   - getBlockByHash()
*   - getBlockByHeight()
*   - getBlocksByWalletAddress()
*   - validate()
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
        this._createGenesisBlock();
    }

    /**
    * This method will check for the height of the chain and if there isn't a Genesis Block it will create it.
    * You should use the `addBlock(block)` to create the Genesis Block
    * Passing as a data `{data: 'Genesis Block'}`
    */
    _createGenesisBlock() {
        if( this.height === -1){
            this.chain.push(Block.genesis());
            this.height = 0;
        }
    }
    
    /**
    * _addBlock(block) will store a block in the chain
    * @param {*} data 
    * The method will return a Promise that will resolve with the block added
    * or reject if an error happen during the execution.
    * You will need to check for the height to assign the `previousBlockHash`,
    * assign the `timestamp` and the correct `height`...At the end you need to 
    * create the `block hash` and push the block into the chain array. Don't forget 
    * to update the `this.height`
    * Note: the symbol `_` in the method name indicates in the javascript convention 
    * that this method is a private method. 
    */
    _addBlock (body) {
        let self = this;
        return new Promise(async (resolve, reject) => {
            try {
                // New Block
                Block.mine(self.chain[self.height], body)
                .then(block => {
                    // Add to the chain and update chain height
                    self.chain.push(block)
                    self.height = block.height;
                    // Resolve promise
                    resolve(block)
                })
            } catch (error) {
                reject(error)  
            }
        });
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
    * This method will return a Promise that will resolve with the Block
    *  with the hash passed as a parameter.
    * Search on the chain array for the block that has the hash.
    * @param {*} hash 
    */
    getBlockByHash(hash) {
        let self = this;
        return new Promise((resolve) => {
            const block = self.chain.filter(p => p.hash === hash)[0];
            resolve(block);
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
            resolve(block);
        });
    }
    
    /**
    * This method will return a Promise that will resolve with an array of blocks which address 
    * belongs to the owner with the wallet address passed as parameter.
    * Remember the block content should be returned decoded.
    * @param {*} address 
    */
    getBlocksByWalletAddress (address) {
        let self = this;
        let blocks = [];
        return new Promise((resolve, reject) => {
            try {
                self.chain.forEach(block => {
                    const body = block.getBodyData()
                    if (body.owner === address) 
                        blocks.push(body)
                });
                resolve(blocks)
            } catch (error) {
                console.log(error)
                reject(error)
            }
        });
    }
    
   /**
    * This method will return a Promise that will resolve with true if the chain is valid.
    * Steps to validate:
    * 1. You should validate each block using `validateBlock`
    * 2. Each Block should check the with the previousBlockHash
    */
    async validate() {
        let self = this;
        return new Promise(async (resolve) => {
            // Check rest of the chain
            let previousHash = self.chain[0].hash
            for (let i = 0; i < self.chain.length; i++) {
                const block = self.chain[i]
                if (block.height > 0 && block.previousHash !== previousHash)
                    return resolve(false)
                const result = await block.validate(block);
                if (!result)
                    return resolve(false)
                previousHash = block.hash;
            }

            resolve(true);
        });
    }

    /**
    * The requestMessageOwnershipVerification(address) method
    * will allow you  to request a message that you will use to sign it with your Bitcoin Wallet (Electrum or Bitcoin Core)
    * This is the first step before submit your Block.
    * The method return a Promise that will resolve with the message to be signed
    * @param {*} address 
    */
     requestMessageOwnershipVerification(address) {
        return new Promise((resolve) => {
            resolve(`${address}:${new Date().getTime().toString().slice(0,-3)}:blockRegistry`)
        });
    }
    
    /**
    * The submitBlock(address, message, signature, content) method
    * will allow users to register a new Block with the content object into the chain.
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
    * @param {*} content 
    */
    submitBlock(address, message, signature, content) {
        let self = this;
        return new Promise(async (resolve, reject) => {
            try {
                const messageTime = parseInt(message.split(':')[1]);
                const currentTime = parseInt(new Date().getTime().toString().slice(0, -3));
                // Message timeout ?
                if ((currentTime-messageTime)/60 > 60)
                    return reject('Timeout')
                // Wrong signature ?
                if (!bitcoinMessage.verify(message, address, signature))
                    return reject('Wrong signature')
                // Add block and resolve/reject promise
                self._addBlock({
                    'owner': address,
                    ...content
                })
                .then(result => resolve(result))
                .catch(error => reject(error))
            } catch (error) {
                console.log(error);
                reject(error)
            }
        });
    }

    /**
     * Returns a promise that resolves to true in case current chain is replaced with new chain (should be longer and valid)
     * @param {Object} blockchain JSON object with a chain that potentially could replace current one
     */
    replaceChain(blockchain) {
        const self = this;
        return new Promise((resolve, reject) => {
            // Only accept new chain if its longer than current one
            if(blockchain.height <= self.height) 
                return resolve(false)
            // Only accept new chain if its also valid
            blockchain.validate()
            .then(result => {
                // New chain is valid and longer. Replace current chain
                if (result) {
                    self.chain = blockchain.chain;
                    self.height = blockchain.height;
                    return resolve(result);
                }
                resolve(false)
            })
        });
    }
}
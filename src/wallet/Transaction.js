// Own nodes
const ChainUtil = require('../util/ChainUtil');

// Config 
const { MINING_REWARD } = require('../config');

/** 
* Transaction
*/
class Transaction {
    
    /**
    * Constructor
    */
    constructor() {
        this.id = ChainUtil.id();
        this.input = null;
        this.outputs = [];
    }
    
    /**
     * 
     * @param {*} senderWallet 
     * @param {*} recipient 
     * @param {*} amount 
     * @returns 
     */
    update(senderWallet, recipient, amount) {

        const senderOutput = this.outputs.find(output => output.address === senderWallet.publicKey);
        
        // Error
        if(amount > senderWallet.amount) return
        
        // Updates amount in the txouput that goes to the sender (remaining balance)
        senderOutput.amount = senderOutput.amount - amount;

        // Push an additional txouput in the transaction
        this.outputs.push({
            amount: amount,
            address: recipient
        });
        
        Transaction.signTransaction(this,senderWallet);

        return this;
    }
   
    /**
     * Helper method that creates a transaction with provided outputs
     * @param {*} senderWallet 
     * @param {*} outputs 
     * @returns 
     */
    static transactionWithOutputs(senderWallet, outputs){
        const transaction = new this();
        transaction.outputs.push(...outputs);
        Transaction.signTransaction(transaction, senderWallet);
        return transaction;
    }

    /**
     * 
     * @param {*} senderWallet 
     * @param {*} recipient 
     * @param {*} amount 
     * @returns 
     */
    static newTransaction(senderWallet, recipient, amount) {
        
        // Error
        if(amount > senderWallet.balance) 
            return
        
        const transaction = new this();
        return Transaction.transactionWithOutputs(
            senderWallet, 
            [{   amount: senderWallet.balance - amount,  address: senderWallet.publicKey   },
            {   amount: amount,                         address: recipient                }]
        );
    }
       
    /**
     * Creates the reward transaction for a miner that provided a new block to the blockchain
     * @param {*} minerWallet Miner wallet 
     * @param {*} blockchainWallet Blockchain wallet
     */
    static rewardTransaction(minerWallet, blockchainWallet) {
        return Transaction.transactionWithOutputs(
            blockchainWallet,
            [{ amount: MINING_REWARD,  address: minerWallet.publicKey }]
        )
    }

    /**
     * 
     * @param {*} transaction 
     * @param {*} senderWallet 
     */
    static signTransaction(transaction, senderWallet) {
        transaction.input = {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(ChainUtil.hash(transaction.outputs))
        }
    }
        
    /**
     * 
     * @param {*} transaction 
     * @returns 
     */
    static verifyTransaction(transaction) {
        return ChainUtil.verifySignature (
            transaction.input.address,
            transaction.input.signature,
            ChainUtil.hash(transaction.outputs)
        )
    }
}
            
module.exports = Transaction;
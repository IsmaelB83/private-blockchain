// Own nodes
const ChainUtil = require('../util/ChainUtil');

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
        
        if(amount > senderWallet.amount) {
            console.log(`Amount ${amount} exceeds balance`);
            return;
        }
        
        senderOutput.amount = senderOutput.amount - amount;

        this.outputs.push({
            amount: amount,
            address: recipient
        });
        
        Transaction.signTransaction(this,senderWallet);
        
        return this;
    }
    
    /**
     * 
     * @param {*} senderWallet 
     * @param {*} recipient 
     * @param {*} amount 
     * @returns 
     */
    static newTransaction(senderWallet, recipient, amount) {
        
        if(amount > senderWallet.balance) {
            console.log(`Amount : ${amount} exceeds the balance`);
            return;
        }
        
        const transaction = new this();
        transaction.outputs.push(...[
            {
                amount: senderWallet.balance - amount,
                address: senderWallet.publicKey
            },
            {
                amount: amount,
                address: recipient
            }
        ]);
        
        Transaction.signTransaction(transaction, senderWallet);
            
        return transaction;
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
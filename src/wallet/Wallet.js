// Own imports
const TransactionPool = require('./TransactionPool');
const Transaction = require('./Transaction');
const ChainUtil = require('../util/ChainUtil');

// Config
const { INITIAL_BALANCE } = require('../config');

/**
 * Class to represent the wallet
 */
class Wallet {

    /**
     * the wallet will hold the public key
     * and the private key pair
     * and the balance
     */
    constructor(balance) {
        this.balance = balance || INITIAL_BALANCE;
        this.keyPair = ChainUtil.genKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    /**
     * Blockchain wallet
     * @returns Returns the blockchain wallet
     */
    static blockchainWallet(){
        const blockchainWallet = new this();
        blockchainWallet.address = 'blockchain-wallet';
        return blockchainWallet;
    }
    
    /**
     * Sign datahash with wallets pkey 
     */
    sign(dataHash) {
        return this.keyPair.sign(dataHash);
    }

    /**
     * To String
     * @returns     
     */
    toString(){
        return `Wallet - 
        publicKey: ${this.publicKey.toString()}
        balance  : ${this.balance}`
    }

    /**
     * Creates a transaction, signs it and add it to the transaction pool
     */
    createTransaction(recipient, amount, transactionPool) {

        if (!amount || !recipient) {
            console.log ('Recipient and amount are mandatory');
            return
        }
        
        if (amount > this.balance) {
            console.log(`Wallet balance ${this.balance} less than transaction amount ${amount}`)
            return
        }
        

        let transaction = transactionPool.existingTransaction(this.publicKey)
        
        if (transaction) {
            transaction.update(this, recipient, amount)
        }
        else {
            transaction = Transaction.newTransaction(this, recipient, amount);
            transactionPool.updateOrAddTransaction(transaction)
        }

        return transaction;
    }
}

module.exports = Wallet;
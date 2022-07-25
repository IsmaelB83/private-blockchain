// Own imports
const Transaction = require('./Transaction')

/**
* Class that holds the pending transactions to be confirmed by miners
*/
class TransactionPool {
    
    /**
    * Constructor will initialize the array of pending transactions    
    */
    constructor() {
        this.transactions = [];
    }
    
    /** 
    * This method will add a transaction it is possible that the transaction exists already
    * so it will replace the transaction with the new transaction after checking the input
    * id and adding new outputs if any we call this method and replace the transaction
    * in the pool.
    */
    updateOrAddTransaction(transaction) {
        
        // get the transaction while checking if it exists
        let transactionWithId = this.transactions.find(t => t.id === transaction.id);
        
        // Update
        if(transactionWithId) {
            this.transactions[this.transactions.indexOf(transactionWithId)] = transaction;
            return;
        }
        // Add
        this.transactions.push(transaction);
    }

    /**
     * Check wether the address has pending transactions in the pool
     * @param {String} address Wallet address
     */
    existingTransaction(address) {
        return this.transactions.find(t => t.input.address === address);
    }

    /**
     * Valid transactions are the one whose total output amounts to the input and whose signatures are same
     */
    validTransactions() {
         return this.transactions.filter(transaction => {
            // Calculates total outputs of the transactions
            const outputTotal = transaction.outputs.reduce((total, output) => (total + output.amount), 0)
            // Input amount should match total output
            if( transaction.input.amount !== outputTotal )
                return console.log(`Invalid transaction from ${transaction.input.address}`);
            // Check transactions signature
            if(!Transaction.verifyTransaction(transaction))
                return console.log(`Invalid signature from ${transaction.input.address}`);
            // Transaction is good here
            return transaction;
        })
    }

    /**
     * Empty transaction pool
     */
    clear() {
        this.transactions = []
    }
}

module.exports = TransactionPool;
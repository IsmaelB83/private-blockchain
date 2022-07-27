// Node modules
// Own modules
const Transaction = require('../wallet/Transaction');
const Wallet = require('../wallet/Wallet');

/**
 * Miner do the computational work to add blocks to the blockchain (PoW)
 */
class Miner {

    /**
     * Constructor
     * @param {*} blockchain Blockchain of the node
     * @param {*} transactionPool Transactions pending to be confirmed (included) in a block
     * @param {*} nodeServer Node of the blockchain
     * @param {*} wallet Wallet to sign transactions
     */
    constructor(blockchain, transactionPool, nodeServer, wallet) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.nodeServer = nodeServer;
        this.wallet = wallet;
    }

    mine() {
        return new Promise(async (resolve, reject) => {
            // Get valid transactions to mine
            const validTransactions = this.transactionPool.validTransactions();
            if (validTransactions.length) {
                // Push reward transaction
                validTransactions.push(Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet()));
                // Start mining
                this.blockchain.addBlock(validTransactions)
                .then(block => {
                    // Block mined
                    this.transactionPool.clear();
                    this.nodeServer.syncBlockchain();
                    this.nodeServer.syncClearTransactions();
                    resolve(block);
                })
                .catch(error => reject(error))
            } else {
                reject('Cero transactions to mine')
            }
        })
    }
}

module.exports = Miner;
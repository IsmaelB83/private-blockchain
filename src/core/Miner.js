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
        const validTransactions = this.transactionPool.validTransactions();
        validTransactions.push(Transaction.rewardTransaction(this.wallet, Wallet.blockchainWallet()));
        return this.blockchain._addBlock(validTransactions)
        .then(block => {
            console.log(block);
            this.syncBlockchain();
            this.transactionPool.clear();
            this.p2pServer.broadcastClearTransactions();
        })
        .catch(error => console.log(error))

    }
}

module.exports = Miner;
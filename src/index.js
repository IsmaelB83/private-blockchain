// Node imports
// Own Imports
const APIServer = require('./APIServer');
const NodeServer = require('./NodeServer.js');
const BlockChain = require('./core/Blockchain.js');
const Miner = require('./core/Miner');
const Wallet = require('./wallet/Wallet');
const TransactionPool = require('./wallet/TransactionPool');

// Config
const { INITIAL_BALANCE } = require('./config')

// create a new wallet and transaction pool
const wallet = new Wallet(INITIAL_BALANCE);
const transactionPool = new TransactionPool();

// Create the blochcain
const blockchain = new BlockChain();

// Run P2P Server
const nodeServer = new NodeServer(blockchain, transactionPool);
nodeServer.listen();

// Miner 
const miner = new Miner(blockchain, transactionPool, nodeServer, wallet);

// Run API server
new APIServer(nodeServer, blockchain, wallet, transactionPool);
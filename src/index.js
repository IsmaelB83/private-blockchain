// Node imports
const APIServer = require('./APIServer');
// Own Imports
const BlockChain = require('./core/Blockchain.js');
const NodeServer = require('./NodeServer.js');
const Wallet = require('./transaction/Wallet');
const TransactionPool = require('./transaction/TransactionPool');

// Config
const { INITIAL_BALANCE } = require('./config')

// create a new wallet
const wallet = new Wallet(INITIAL_BALANCE);

// create a new transaction pool which will be later decentralized and synchronized using the peer to peer server
const transactionPool = new TransactionPool();

// Create the blochcain
const blockchain = new BlockChain();

// Run P2P Server
const nodeServer = new NodeServer(blockchain, wallet, transactionPool);
nodeServer.listen();

// Run API server
new APIServer(nodeServer, blockchain, wallet, transactionPool);
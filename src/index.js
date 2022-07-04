// Node imports
const APIServer = require('./APIServer');
// Own Imports
const BlockChain = require('./core/Blockchain.js');
const NodeServer = require('./NodeServer.js');

// Create the blochcain
const blockchain = new BlockChain();

// Run P2P Server
const nodeServer = new NodeServer(blockchain);
nodeServer.listen();

// Run API server
new APIServer(nodeServer, blockchain);
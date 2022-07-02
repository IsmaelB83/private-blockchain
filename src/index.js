// Node imports
const ApplicationServer = require('./ApplicationServer');
// Own Imports
const BlockChain = require('./core/Blockchain.js');
const P2PServer = require('./P2PServer.js');

// Create the blochcain
const blockchain = new BlockChain();

// Run API server
new ApplicationServer(blockchain);
// Run P2P Server
const p2pserver = new P2PServer(blockchain);
p2pserver.listen();
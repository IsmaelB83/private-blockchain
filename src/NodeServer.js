// Node imports
const { Block } = require('bitcoinjs-lib');
const WebSocket = require('ws');
// Own imports
const Blockchain = require('./core/Blockchain');
const Transaction = require('./wallet/Transaction');
const { NODE_PORT,  } = require('./config'); 

// Message types (broadcast transactions and chains)
const MESSAGE_TYPE = {
    chain: 'CHAIN',
    transaction: 'TRANSACTION'
}

// Declare the list of nodes in the blockchain to connect to
const PEERS = process.env.PEERS ? process.env.PEERS.split(',') : [];

class NodeServer {
    
    /**
    * Constructor
    * @param {Object} Blockchain 
    */
    constructor(blockchain, transactionPool) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;
        this.sockets = []
    }
    
    /**
    * Listen and connect to peers
    */
    listen() {
        // Create the p2p server with port as argument
        const server = new WebSocket.Server({ port: NODE_PORT });
        // Event listener and a callback function for any new connection on any new connection
        // the current instance will send the current chain to the newly connected peer
        server.on('connection', socket => this.connectSocket(socket));
        // To connect to the peers that we have specified
        this.connectToPeers();
        // Logs
        console.log(`BC Node on Port: ${NODE_PORT}`);
    }
    
    /**
    * Connect to peers in the network
    */
    connectToPeers(){
        // Connect to each peer
        PEERS.forEach(peer => {
            try {
                // create a socket for each peer
                const socket = new WebSocket(peer);
                // open event listener is emitted when a connection is established. saving the socket in the array
                socket.on('open',() => this.connectSocket(socket));   
            } catch (error) {
                console.log(`Error connecting with peer ${peer}`)
            }
        });
    }
    
    /**
    * Handler when connection is done
    * @param {*} socket 
    */
    connectSocket(socket){
        try {
            // push the socket too the socket array
            this.sockets.push(socket);
            console.log('Socket connected');
            // register a message event listener to the socket
            this.messageHandler(socket);
            // on new connection send the blockchain and transaction pool to the peer
            this.sendBlockchain(socket);
            this.transactionPool.transactions.forEach(transaction => {
                this.sendTransaction(socket, transaction);
            });        
        } catch (error) {
            console.log(error)
        }
    }
    
    /**
    * Handler when a message is receive from socket
    * @param {*} socket 
    */
    messageHandler(socket){
        // on recieving a message execute a callback function
        socket.on('message', message => {
            try {
                // Parse received chain
                let data = JSON.parse(message);
                switch (data.type) {
                    case MESSAGE_TYPE.chain:
                        // Build js objects from JSON
                        const blockchain = Object.setPrototypeOf(data.chain, Blockchain.prototype)
                        const chain = Object.setPrototypeOf(blockchain.chain, Array.prototype);
                        for (let i = 0; i < chain.length; i++) {
                            chain[i] = Object.setPrototypeOf(chain[i], Block.prototype)
                        }
                        console.log(`Chain received has ${chain.length} blocks`);
                        // Try to replace current chain if it fits conditions
                        this.blockchain.replaceChain(blockchain)
                        .then(result => console.log(`Replaced ${result}`))
                        .catch(error => console.log(error))
                        break;
                    case MESSAGE_TYPE.transaction:
                        const transaction = Object.setPrototypeOf(data.transaction, Transaction.prototype);
                        console.log(`Received ${JSON.stringify(transaction)} transaction`)
                        this.transactionPool.updateOrAddTransaction(transaction);
                        break;
                }
            } catch (error) {
                console.log(error)
            }
        });
    }
    
    /**
    * Method to sync blockchain among nodes whenever a new block is added to the blockchain
    */
    syncBlockchain() {
        this.sockets.forEach(socket =>{
            this.sendChain(socket);
        }); 
    }
    
    /**
     * Method to sync transactions among nodes whenever a new transaction is added to the pool
     * @param {*} transaction 
     */  
    syncTransaction(transaction){
        this.sockets.forEach(socket => {
            this.sendTransaction(socket, transaction);
        }); 
    }
    
    /**
     * Send a transaction trough the socket
     * @param {Object} socket Socket connection
     * @param {Object} transaction Transaction to sync
     */
    sendTransaction(socket, transaction){
        // JSON string
        const txJSON = JSON.stringify({
            type: MESSAGE_TYPE.transaction,
            transaction: transaction
        })
        // Send
        socket.send(txJSON);
    }
    
    /**
     * Send current blockchain trough the socket
    * @param {Object} socket Socket connection
    */
    sendBlockchain(socket){
        // JSON string
        const bcJSON = JSON.stringify({
            type: MESSAGE_TYPE.chain,
            chain: this.blockchain
        })
        // Send
        socket.send(bcJSON);
    }
}

module.exports = NodeServer;
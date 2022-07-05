// Node imports
const { Block } = require('bitcoinjs-lib');
const WebSocket = require('ws');
// Own imports
const Blockchain = require('./core/Blockchain');
const { NODE_PORT,  } = require('./config'); 

// Declare the list of nodes in the blockchain to connect to
const PEERS = process.env.PEERS ? process.env.PEERS.split(',') : [];

class NodeServer {
    
    /**
    * Constructor
    * @param {Object} Blockchain 
    */
    constructor(blockchain) {
        this.blockchain = blockchain;
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
                // open event listner is emitted when a connection is established
                // saving the socket in the array
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
            // on new connection send the blockchain chain to the peer
            this.sendChain(socket);           
        } catch (error) {
            console.log(error)
        }
    }
    
    /**
    * 
    * @param {*} socket 
    */
    messageHandler(socket){
        //on recieving a message execute a callback function
        socket.on('message', message =>{
            try {
                // Parse received chain
                let data = JSON.parse(message);
                data = Object.setPrototypeOf(data, Blockchain.prototype);
                data.chain = Object.setPrototypeOf(data.chain, Array.prototype);
                for (let i = 0; i < data.chain.length; i++) {
                    data.chain[i] = Object.setPrototypeOf(data.chain[i], Block.prototype)
                }
                console.log(`Chain received has ${data.chain.length} blocks`);
                // Try to replace current chain if it fits conditions
                this.blockchain.replaceChain(data)
                .then(result => console.log(`Replaced ${result}`))
                .catch(error => console.log(error))
                // Log
            } catch (error) {
                console.log(error)
            }
        });
    }
    
    /**
    * helper function to send the chain instance
    * @param {*} socket 
    */
    sendChain(socket){
        try {
            socket.send(JSON.stringify(this.blockchain));
        } catch (error) {
            console.log(error)
        }
    }
    
    /**
    * utility function to sync the chain whenever a new block is added to the blockchain
    */
    syncChain(){
        try {
            this.sockets.forEach(socket =>{
                this.sendChain(socket);
            }); 
        } catch (error) {
            console.log(error)
        }
    }
}

module.exports = NodeServer;
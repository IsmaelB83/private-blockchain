const WebSocket = require('ws');

// Declare the peer to peer server port 
const P2P_PORT = process.env.P2P_PORT || 5001
// Declare the list of nodes in the blockchain to connect to
const PEERS = process.env.PEERS ? process.env.PEERS.split(',') : [];

class P2PServer {
    
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
        const server = new WebSocket.Server({ port: P2P_PORT });
        // Event listener and a callback function for any new connection on any new connection
        // the current instance will send the current chain to the newly connected peer
        server.on('connection', socket => this.connectSocket(socket));
        // To connect to the peers that we have specified
        this.connectToPeers();
        // Logs
        console.log(`Listening for peer to peer connection on port : ${P2P_PORT}`);
    }
    
    /**
    * Connect to peers in the network
    */
    connectToPeers(){
        // Connect to each peer
        PEERS.forEach(peer => {
            // create a socket for each peer
            const socket = new WebSocket(peer);
            // open event listner is emitted when a connection is established
            // saving the socket in the array
            socket.on('open',() => this.connectSocket(socket));
        });
    }
    
    /**
    * Handler when connection is done
    * @param {*} socket 
    */
    connectSocket(socket){
        // push the socket too the socket array
        this.sockets.push(socket);
        console.log('Socket connected');
        // register a message event listener to the socket
        this.messageHandler(socket);
        // on new connection send the blockchain chain to the peer
        this.sendChain(socket);
    }
    
    /**
    * 
    * @param {*} socket 
    */
    messageHandler(socket){
        //on recieving a message execute a callback function
        socket.on('message',message =>{
            const data = JSON.parse(message);
            console.log('data', data);
            this.blockchain.replaceChain(data);
        });
    }
    
    /**
    * helper function to send the chain instance
    * @param {*} socket 
    */
    sendChain(socket){
        socket.send(JSON.stringify(this.blockchain.chain));
    }
    
    /**
    * utility function to sync the chain whenever a new block is added to the blockchain
    */
    syncChain(){
        this.sockets.forEach(socket =>{
            this.sendChain(socket);
        });
    }
}

module.exports = P2PServer;
// Node imports
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
// Own impots
const { HTTP_PORT } = require('./config'); 

class APIServer {

    constructor(nodeServer, blockchain, wallet, transactionPool, miner) {
        // Express application object
        this.app = express();
        // Blockchain class object
        this.blockchain = blockchain;
        // Wallet
        this.wallet = wallet;
        // Transaction pool of this node
        this.transactionPool = transactionPool;
        // Node Server
        this.nodeServer = nodeServer;
        // Miner
        this.miner = miner;
        // Method that initialized the express framework.
        this.initExpress();
        // Method that initialized middleware modules
        this.initExpressMiddleWare();
        // Method that initialized the controllers where you defined the endpoints
        this.initControllers();
        // Method that run the express application.
        this.start();
    }

    initExpress() {
        this.app.set('port', HTTP_PORT);
    }

    initExpressMiddleWare() {
        this.app.use(morgan('dev'));
        this.app.use(bodyParser.urlencoded({extended:true}));
        this.app.use(bodyParser.json());
    }

    initControllers() {
        require('./controllers/BlockchainController.js')(this.app, this.blockchain, this.nodeServer, this.wallet, this.transactionPool, this.miner);
    }

    start() {
        let self = this;
        this.app.listen(this.app.get('port'), () => {
            console.log(`API on Port: ${self.app.get('port')}`);
        });
    }
}

module.exports = APIServer;
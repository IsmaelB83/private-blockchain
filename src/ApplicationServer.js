// Node imports
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
// Own Imports
 
const HTTP_PORT = process.env.HTTP_PORT || 3001;

class ApplicationServer {

    constructor(blockchain) {
        // Express application object
        this.app = express();
        // Blockchain class object
        this.blockchain = blockchain;
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
        require('./controllers/BlockchainController.js')(this.app, this.blockchain);
    }

    start() {
        let self = this;
        this.app.listen(this.app.get('port'), () => {
            console.log(`Server Listening for port: ${self.app.get('port')}`);
        });
    }

}

module.exports = ApplicationServer;
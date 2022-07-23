/**
*  BlockchainController
* 
* This class expose the endpoints that the client applications will use to interact with the 
* Blockchain dataset
*/
class BlockchainController {
    
    /**
    * The constructor receive the instance of the express.js app and the Blockchain class
    * @param {*} app Instance of the express app
    * @param {*} blockchain 
    * @param {*} nodeServer
    * @param {*} wallet
    * @param {*} transactionPool
    */
    constructor(app, blockchain, nodeServer, wallet, transactionPool) {
        this.app = app;
        this.blockchain = blockchain;
        this.nodeServer = nodeServer;
        this.wallet = wallet;
        this.transactionPool = transactionPool;
        // All the endpoints methods needs to be called in the constructor to initialize the route.
        this.welcome();
        this.getBlockByHeight();
        this.getBlockByHash();
        this.getBlocksByAddress();
        this.requestVerificationMessage();
        this.submitBlock();
        this.printBlockchain();
        this.validateBlockhain();
        this.printTransactionPool();
        this.postTransaction();
    }
    
    // Test api
    welcome() {
        this.app.get('/', async(req, res) => {
            const welcomeMessage = `
            Hello to the blockchain API\n
            Available endpoints are:\n
            
            Welcome endpoint
            1) http://localhost:8000/ (GET)
            
            Query for blocks
            2) http://localhost:8000/blockchain/block/height/:height (GET)
            3) http://localhost:8000/blockchain/block/hash/:hash (GET)
            4) http://localhost:8000/blockchain/block/address/:address (GET)
            
            Add new blocks
            5) http://localhost:8000/blockchain/block/requestmessage (POST)
            6) http://localhost:8000/blockchain/block (POST)
            
            Log and validate blockchain
            7) http://localhost:8000/blockchain (GET)
            8) http://localhost:8000/blockchain/validation (GET)
            
            Transaction pool
            9) http://localhost:8000/transaction (GET)
            10) http://localhost:8000/transaction (POST)

            `;
            res.send(welcomeMessage);
        });
    }
    
    // Enpoint to Get a Block by Height (GET Endpoint)
    getBlockByHeight() {
        this.app.get('/blockchain/block/height/:height', async (req, res) => {
            if(req.params.height) {
                const height = parseInt(req.params.height);
                let block = await this.blockchain.getBlockByHeight(height);
                if(block){
                    return res.status(200).json(block);
                } else {
                    return res.status(404).send('Block Not Found!');
                }
            } else {
                return res.status(404).send('Block Not Found! Review the Parameters!');
            }
            
        });
    }
    
    // This endpoint allows you to retrieve the block by hash (GET endpoint)
    getBlockByHash() {
        this.app.get('/blockchain/block/hash/:hash', async (req, res) => {
            if(req.params.hash) {
                const hash = req.params.hash;
                let block = await this.blockchain.getBlockByHash(hash);
                if(block){
                    return res.status(200).json(block);
                } else {
                    return res.status(404).send('Block Not Found!');
                }
            } else {
                return res.status(404).send('Block Not Found! Review the Parameters!');
            }
        });
    }
    
    // This endpoint allows you to request the list of Stars registered by an owner
    getBlocksByAddress() {
        this.app.get('/blockchain/block/address/:address', async (req, res) => {
            if(req.params.address) {
                const address = req.params.address;
                try {
                    let stars = await this.blockchain.getBlocksByWalletAddress(address);
                    if(stars.length){
                        return res.status(200).json(stars);
                    } else {
                        return res.status(404).send('Block Not Found!');
                    }
                } catch (error) {
                    return res.status(500).send(JSON.stringify(error));
                }
            } else {
                return res.status(500).send('Blocks Not Found! Review the Parameters!');
            }
            
        });
    }
    
    // Endpoint that allows user to request Ownership of a Wallet address (POST Endpoint)
    requestVerificationMessage() {
        this.app.post('/blockchain/block/requestmessage', async (req, res) => {
            if(req.body.address) {
                const address = req.body.address;
                const message = await this.blockchain.requestMessageOwnershipVerification(address);
                if(message){
                    return res.status(200).json(message);
                } else {
                    return res.status(500).send('An error happened!');
                }
            } else {
                return res.status(500).send('Check the Body Parameter!');
            }
        });
    }
    
    // Endpoint that allow submit a star, you need first to `requestOwnership` to have the message (POST endpoint)
    submitBlock() {
        this.app.post('/blockchain/block', async (req, res) => {
            if(req.body.address && req.body.message && req.body.signature && req.body.star) {
                const address = req.body.address;
                const message = req.body.message;
                const signature = req.body.signature;
                const star = req.body.star;
                try {
                    let block = await this.blockchain.submitBlock(address, message, signature, star);
                    if(block) {
                        this.nodeServer.syncBlockchain();
                        return res.status(200).json(block);
                    }
                    return res.status(500).send('An error happened!');
                } catch (error) {
                    return res.status(500).send(JSON.stringify(error));
                }
            } else {
                return res.status(500).send('Check the Body Parameter!');
            }
        });
    }
    
    // Log blockchain contents
    printBlockchain() {
        this.app.get('/blockchain', async(req, res) => {
            res.send(this.blockchain);
        });
    }
    
    // This endpoint allows to validate the blockchain
    validateBlockhain() {
        this.app.get('/blockchain/validate', async(req, res) => {
            this.blockchain.validate()
            .then(result => (res.status(200).send(result)))
        });
    }

    // This endpoint returns the transaction pool of this node
    printTransactionPool() {
        this.app.get('/transaction', async(req, res) => {
            res.send(this.transactionPool);
        });
    }

    // Creates a new transaction
    postTransaction() {
        this.app.post('/transaction', async(req, res) => {
            const { recipient, amount } = req.body;
            const transaction = this.wallet.createTransaction(recipient, amount, this.transactionPool);
            if (transaction) {
                this.nodeServer.syncTransaction(transaction)
                return res.redirect('/transaction');
            }
            return res.status(500).send('Wrong information');
        });
    }
}

module.exports = (app, blockchain, nodeServer, wallet, transactionPool) => { return new BlockchainController(app, blockchain, nodeServer, wallet, transactionPool);}
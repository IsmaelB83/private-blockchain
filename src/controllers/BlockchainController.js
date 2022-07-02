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
    */
    constructor(app, blockchain) {
        this.app = app;
        this.blockchain = blockchain;
        // All the endpoints methods needs to be called in the constructor to initialize the route.
        this.welcome();
        this.getBlockByHeight();
        this.getBlockByHash();
        this.getBlocksByAddress();
        this.requestVerificationMessage();
        this.submitBlock();
        this.printBlockchain();
        this.validateBlockhain();
    }
    
    // Test api
    welcome() {
        this.app.get('/', async(req, res) => {
            const welcomeMessage = `
            Hello to the blockchain API\n
            Available endpoints are:\n
            
            Welcome endpoint
            1) http://localhost:8000/
            
            Query for blocks
            2) http://localhost:8000/blockchain/block/height/:height
            3) http://localhost:8000/blockchain/block/hash/:hash
            4) http://localhost:8000/blockchain/block/address/:address
            
            Add new blocks
            5) http://localhost:8000/blockchain/block/requestmessage
            6) http://localhost:8000/blockchain/block
            
            Log and validate blockchain
            7) http://localhost:8000/blockchain
            8) http://localhost:8000/blockchain/validation
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
                    return res.status(500).send('An error happened!');
                }
            } else {
                return res.status(500).send('Blocks Not Found! Review the Parameters!');
            }
            
        });
    }
    
    // Endpoint that allows user to request Ownership of a Wallet address (POST Endpoint)
    requestVerificationMessage() {
        this.app.post('/blockchain/block/requestmessage ', async (req, res) => {
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
                    if(block) return res.status(200).json(block);
                    return res.status(500).send('An error happened!');
                } catch (error) {
                    return res.status(500).send(error);
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
            try {
                const errorLog = this.blockchain.validateChain();
                res.status(200).send(errorLog);
            } catch (error) {
                res.status(500).send(error)
            }
        });
    }
}

module.exports = (app, blockchain) => { return new BlockchainController(app, blockchain);}
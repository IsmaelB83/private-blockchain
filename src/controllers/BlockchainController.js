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
        this.hello();
        this.log();
        this.getBlockByHeight();
        this.requestOwnership();
        this.submitStar();
        this.getBlockByHash();
        this.getStarsByOwner();
        this.validateChain();
    }

    // Test api
    hello() {
        this.app.get('/', async(req, res) => {
            const welcomeMessage = `
                Hello to the blockchain API\n
                Available endpoints are:\n
                1) http://localhost:8000/
                2) http://localhost:8000/log
                3) http://localhost:8000/block/height/:height
                4) http://localhost:8000/block/hash/:hash
                5) http://localhost:8000/requestValidation
                6) http://localhost:8000/submitstarnp
                7) http://localhost:8000/blocks/validate
                8) http://localhost:8000/blocks/address/:address
            `;
            res.send(welcomeMessage);
        });
    }

    // Log blockchain contents
    log() {
        this.app.get('/log', async(req, res) => {
            res.send(this.blockchain);
        });
    }

    // Enpoint to Get a Block by Height (GET Endpoint)
    getBlockByHeight() {
        this.app.get('/block/height/:height', async (req, res) => {
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
        this.app.get('/block/hash/:hash', async (req, res) => {
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

    // Endpoint that allows user to request Ownership of a Wallet address (POST Endpoint)
    requestOwnership() {
        this.app.post('/requestValidation', async (req, res) => {
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

    // Endpoint that allow Submit a Star, yu need first to `requestOwnership` to have the message (POST endpoint)
    submitStar() {
        this.app.post('/submitstar', async (req, res) => {
            if(req.body.address && req.body.message && req.body.signature && req.body.star) {
                const address = req.body.address;
                const message = req.body.message;
                const signature = req.body.signature;
                const star = req.body.star;
                try {
                    let block = await this.blockchain.submitStar(address, message, signature, star);
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

    // This endpoint allows you to request the list of Stars registered by an owner
    getStarsByOwner() {
        this.app.get('/blocks/address/:address', async (req, res) => {
            if(req.params.address) {
                const address = req.params.address;
                try {
                    let stars = await this.blockchain.getStarsByWalletAddress(address);
                    if(stars.length){
                        return res.status(200).json(stars);
                    } else {
                        return res.status(404).send('Block Not Found!');
                    }
                } catch (error) {
                    return res.status(500).send('An error happened!');
                }
            } else {
                return res.status(500).send('Block Not Found! Review the Parameters!');
            }
            
        });
    }
    
    // This endpoint allows to validate the blockchain
    validateChain() {
        this.app.get('blocks/validate', async(req, res) => {
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
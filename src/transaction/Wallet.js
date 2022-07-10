// Own imports
const ChainUtil = require('../util/ChainUtil');
const { INITIAL_BALANCE } = require('../config');

class Wallet {

    /**
     * the wallet will hold the public key
     * and the private key pair
     * and the balance
     */
    constructor() {
        this.balance = INITIAL_BALANCE;
        this.keyPair = ChainUtil.genKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    /**
     * Sign datahash with wallets pkey 
     */
    sign(dataHash) {
        return this.keyPair.sign(dataHash);
    }

    /**
     * To String
     * @returns     
     */
    toString(){
        return `Wallet - 
        publicKey: ${this.publicKey.toString()}
        balance  : ${this.balance}`
    }
}

module.exports = Wallet;
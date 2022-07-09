// Node imports
const EC = require('elliptic').ec;
const sha256 = require('crypto-js/sha256');
const uuidV1 = require('uuid/v1');

// secp256k1 is the algorithm to generate key pair
const ec = new EC('secp256k1');

/**
 * Class for cryptography utils
 */
class ChainUtil {
    
    static genKeyPair() {
        return ec.genKeyPair();
    }

    static id() {
        return uuidV1();
    }

    static hash(data) {
        return sha256(JSON.stringify(data)).toString();
    }

    static verifySignature(publicKey, signature,dataHash){
        return ec.keyFromPublic(publicKey,'hex').verify(dataHash, signature);
    }
}

module.exports = ChainUtil;
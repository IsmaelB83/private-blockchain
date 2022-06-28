/**
 * Main class that handles a block of our simple private blockchain
 */
 export default class Block {
    
    constructor(data) {
        this.height = 0
        this.timeStamp = 0
        this.data = data 
        this.previousHash = ""
        this.hash = ""
    }
}
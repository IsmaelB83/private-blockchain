// Own imports
const Block = require('./Block');

/**
* Testing suit for Block class
*/
describe("Block",()=>{
    
    let data, lastBlock, block;
    
    /**
    * Initilization code before all tests
    */
    beforeEach(()=>{
        data = {name: 'foo'};
        lastBlock = Block.genesis();
        Block.mine(lastBlock, data)
        .then(result => block = result);
    });
    
    /**
    * Check decoded body data is right
    */
    it("sets the `data` to match the input",()=> {
        expect(block.getBodyData()).toEqual(data)
    });
    
    /**
    * Check previousHash is properly assigned when mining blocks
    */
    it("sets the `lastHash` to match the hash of the last block",()=>{
        expect(block.previousHash).toEqual(lastBlock.hash);
    });
    
    /**
    * Hashes are generated alligned with difficulty
    */
    it('generates a hash that matches the difficutly',()=>{
        expect(block.hash.substring(0,block.difficulty)).toEqual('0'.repeat(block.difficulty));
    });
    
    /**
    * Lower the difficulty for a slower generated block
    */
    it('lower the difficulty for a slower generated block',()=>{
        expect(Block.adjustDifficulty(block,block.timeStamp + 300000)).toEqual(block.difficulty - 1);
    });
    
    /**
    * Raise difficulty for a faster generated block
    */
    it('raise the difficulty for a faster generated block',()=>{
        expect(Block.adjustDifficulty(block, block.timeStamp + 1)).toEqual(block.difficulty + 1);
    });
    
})
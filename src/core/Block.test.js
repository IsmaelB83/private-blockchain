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

})
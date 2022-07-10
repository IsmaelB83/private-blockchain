// Own node
const Blockchain = require('./Blockchain');
const Block = require('./Block');

describe("Blockchain",()=>{
    
    let blockchain;
    
    beforeEach(()=>{
        blockchain = new Blockchain();
    });
    
    it('starts with the genesis block',()=>{
        expect(blockchain.chain[0]).toEqual(Block.genesis());
    });
    
    it('adds a new block',()=>{
        const data = {name: 'var'};
        blockchain._addBlock(data)
        .then(block => {
            const body = blockchain.chain[blockchain.chain.length-1].getBodyData()
            expect(body).toEqual(data)
        })
    }); 
    
    it('validates a valid chain',()=>{
        const data = {name: 'foo'}
        blockchain._addBlock(data)
        .then(block => {
            blockchain.validate()
            .then(result => expect(result).toBe(true));
        })
    });
    
    it('invalidates a chain with a corrupt the genesis block',()=> {
        const auxChain1 = new Blockchain();
        auxChain1.chain[0].setBodyData({name:  'Corrupted genesis block'});
        auxChain1.validate()
        .then(result => expect(result).toBe(false))
    });
    
    it('invalidates a corrupt chain in one of its blocks',()=>{
        const auxChain2 = new Blockchain();
        auxChain2._addBlock('foo')
        .then(block => {
            auxChain2.chain[auxChain2.chain.length-1].setBodyData({name: "corrupted"});
            auxChain2.validate()
            .then(result => expect(result).toBe(false))
        })
    });
    
    it('replaces the chain with a valid chain',()=>{
        blockchain._addBlock('goo')
        .then(block => {
            const auxChain3 = new Blockchain();
            auxChain3.replaceChain(blockchain)
            .then(result => expect(result).toBe(true))
        })
    });
    
    it('does not replaces the chain with a one with less than or equal to chain',()=>{
        const auxChain = new Blockchain();
        blockchain.replaceChain(auxChain)
        .then(result => expect(result).toBe(false))
    });
});


// Own imports
const Wallet = require('./Wallet');
const TransactionPool = require('./TransactionPool');
const Blockchain = require('../core/Blockchain');

// Constants
const { INITIAL_BALANCE } = require('../config');

describe('Wallet', () => {

    let wallet, transactionPool, blockchain;
    
    beforeEach(() => {
        wallet = new Wallet(INITIAL_BALANCE);
        transactionPool = new TransactionPool();
        blockchain = new Blockchain();
    });

    describe('creating a transaction', () => {

        let transaction, sendAmount, recipient;

        beforeEach(()=>{
            sendAmount = 50;
            recipient = 'r4nd0m-4ddr33s';
            transaction = wallet.createTransaction(recipient, sendAmount, transactionPool);
        });

        describe('and doing the same transaction', () => {
            
            beforeEach( () => {
                // this will create another output for the same transaction
                wallet.createTransaction(recipient, sendAmount, transactionPool);
            });

            // this will check if the output address back to the sender is reduced twice the sendAmount
            it('doubles the `sendAmount` subtracted from the wallet balance', () => {
                expect(transaction.outputs.find(output => output.address === wallet.publicKey).amount).toEqual(wallet.balance - sendAmount * 2);
            });

            // checks if output was created again
            it('clones the `sendAmount` output for the transaction ', () => {
                // filter will return only those items that satisfy the condition
                // hence an array of only the required outputs
                // map will do some processing over each individual item and replace it with something
                // else here the amount of the output
                expect(transaction.outputs.filter(output => output.address === recipient).map(output => output.amount)).toEqual([sendAmount,sendAmount]);
            });
        });
    });
});
// Own imports
const TransactionPool = require('./TransactionPool');
const Blockchain = require('../core/Blockchain');
const Wallet = require('./Wallet');

// Config
const { INITIAL_BALANCE } = require('../config');

describe('Transaction Pool',()=>{

    let transactionPool, wallet, transaction, blockchain;

    beforeEach(()=>{
        blockchain = new Blockchain();
        transactionPool = new TransactionPool();
        wallet = new Wallet(INITIAL_BALANCE);
        transaction = wallet.createTransaction('r4nd-addr355', 30, blockchain, transactionPool);
    });

    it('adds a transaction to the pool',()=>{
        expect(transactionPool.transactions.find(t => t.id === transaction.id)).toEqual(transaction);
    });

    it('updates a transaction in the pool',()=>{
        const oldTransaction = JSON.stringify(transaction);
        newTransaction = transaction.update(wallet,'foo-4ddr355',40);
        transactionPool.updateOrAddTransaction(newTransaction);
        expect(JSON.stringify(transactionPool.transactions.find(t => t.id === transaction.id)))
        .not.toEqual(oldTransaction);
    });

    it('clears transactions',()=>{
        transactionPool.clear();
        expect(transactionPool.transactions).toEqual([]);
    })

    describe('mixing valid and corrupt transactions',()=>{
        
        let validTransactions;

        beforeEach(()=>{

            validTransactions = [...transactionPool.transactions];

            // creating new transactions with corrupted transactions
            for (let i = 0;i<6;i++){
                wallet = new Wallet();
                transaction = wallet.createTransaction('r4nd-4ddr355', 30, blockchain, transactionPool);
                if(i&1){
                    transaction.input.amount = 999999;
                }
                else {
                    validTransactions.push(transaction);
                }
            }
        });

        it('shows a difference between valid adnd corrupt transactions',()=>{
            expect(JSON.stringify(transactionPool.transactions)).not.toEqual(JSON.stringify(validTransactions));
        });

        it('grabs valid transactions',()=>{
            expect(transactionPool.validTransactions()).toEqual(validTransactions);
        })

        
    });
});
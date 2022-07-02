# private-blockchain
First project of udacity's blockchain developer nanodegree program

## Download and installation
1) git clone https://github.com/IsmaelB83/private-blockchain.git
2) cd private-blockchain
3) npm install
4) npm start

## API Test
1) http://localhost:8000/                           --> Hello world endpoint
2) http://localhost:8000/log                        --> Response with the content of the blockchain
3) http://localhost:8000/block/height/:height       --> Search a block by its height
4) http://localhost:8000/block/hash/:hash           --> Search a block by its hash
5) http://localhost:8000/requestValidation          --> Request a message to submit a star
6) http://localhost:8000/submitstar                 --> Submit a star to the blockchain
7) http://localhost:8000/blocks/validate            --> Validate blocks in the blockchain
8) http://localhost:8000/blocks/address/:address    --> Returns all the blocks associated to the block address

## Sign messages
An easy way to sign messaes is trough online tool https://reinproject.org/bitcoin-signature-tool/#sign
Other option is us Electrum or Bitcoin Core to generate a PKey and sign transactions with it.
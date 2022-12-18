---
layout: post
title: "Blockchain introduction"
date: 2022-10-24 18:36:00 +0200
categories: blockchain ethereum bitcoin
---

_On October 31, 2008, Satoshi Nakamoto published a white paper entitled "[Bitcoin: A peer-to-peer electronic cash system](https://bitcoin.org/bitcoin.pdf)", in which he described a system that would enable P2P payments without a financial intermediary._

The blockchain is a **P2P transaction model** that enables two parties to transact in a **temper-resistant** and **cryptographically proven** way. Essentially, it relies on three pillars: peer-to-peer networks, cryptography, and a consensus mechanism.

Each computer participating in this P2P network is called a **node**. Each node stores records of transactions in multiple **consecutive blocks**. Once all nodes in the network have stored and verified a transaction, it is impossible to change the transaction without changing all subsequent and previous blocks. For this reason, blockchain transactions are **irreversible**, as blockchain transactions and their data are only appended.

![chain-of-blocks](https://davdifr.github.io/assets/images/chain-of-blocks.svg){:style="display:block; margin-left:auto; margin-right:auto"}

Blocks are connected by a link (also called a **chain**). The link between two blocks _(Figure 1)_ is implemented by recording the previous block's cryptographic hash so that it can be visited in reverse chronological order.

The following table shows the data structure for a **block header** (in Bitcoin):

| Field          | Purpose                                                    | Updated when...              | Size (Bytes) |
| -------------- | ---------------------------------------------------------- | ---------------------------- | ------------ |
| Version        | Block version number                                       | You upgrade the software     | 4            |
| hashPrevBlock  | 256-bit hash of the previous block header                  | A new block comes in         | 32           |
| hashMerkleRoot | 256-bit hash based on all of the transactions in the block | A transaction is accepted    | 32           |
| Time           | Current timestamp as seconds                               | Every few seconds            | 4            |
| Bits           | Current target in compact format                           | The difficulty is adjusted   | 4            |
| Nonce          | 32-bit number (starts at 0)                                | A hash is tried (increments) | 4            |

In particular, hashPrevBlock refers to the 256-bit hash value of the previous block, and hashMerkleRoot is the hash Merkle root of all transactions in the block, including coinable transactions. And the nonce is the magic number that miners must find so that the SHA-256 hash value of the block header is smaller than or equal to the blockchain-defined specific target.

## Transaction process overview

Assuming user A wants to buy something from user B _(Figure 2)_ and agrees to pay B 10 Bitcoins (BTC), the transaction proceeds as follows:

![transaction-a-b](https://davdifr.github.io/assets/images/transaction-a-b.svg){:style="display:block; margin-left:auto; margin-right:auto"}

1. **Create blockchain transactions:** A transaction is a transfer of value between two parties. When A sends 10 BTC to B, a transaction is created with one or more inputs and outputs, where the inputs reflect A's account and the outputs reflect the accounts A wants to transfer. The transaction is digitally signed with A's private key and broadcasted to the P2P network. The recipient uses the digital signature to verify ownership of A's funds.
2. **Validate the transactions and add them to the transaction pool:** Once the transaction is submitted to the blockchain network, the bookkeeper node (a node that receives the transactions) validates it according to the business and technical rules set by the blockchain network. If the transaction is valid, the bookkeeper adds it to the transaction pool and forwards the transaction to peers on the network.
3. **Create the candidate blocks:** Transactions in the transaction pool are collected into a block at regular intervals. In a Bitcoin network, every 10 minutes a subset of network nodes called **mining nodes** (or miners) collect all valid transactions from the transaction pool and create the candidate blocks.
4. **Mining the new block:** Once the block candidate is created, the race begins for the chance to add new blocks and win the rewards. The process of such a race is called **mining**. The winner of the race is determined by the consensus mechanism (in this case the PoW mechanism, which will be described in the next part). The miners keep trying to find a random number, the nonce in the block header structure, until the hash meets certain demanding conditions. For example, one of these conditions is that _the resulting block hash is less than a target number_, or in some cases, the _hash has a few leading zeros_. In practice, any random number has an equal chance of winning the race, so you can practically just start a loop from 1 to 2^32 until you find such a nonce. It takes a tremendous CPU hashing effort to find such a nonce. The challenging condition, called difficulty, can be adjusted based on the target count or bits in the block header structure. The difficulty of winning the race grows exponentially with the smaller target number or fewer bits in the block header structure.
5. **Add a new block to the blockchain:** The first winning node will announce the new block to the rest of the network for verification. Once the block is verified and approved by the majority of the network's miners, it will be accepted and form the new top of the chain. Since all blocks are chained together by linking the hash value to the previous block, any change to the ledger becomes impossible as it requires PoW for all previous transitions.

## Consensus mechanism

Consensus in a blockchain is the process by which a network of mutually distrustful nodes reaches an agreement on the global state of the blockchain. In a blockchain, transactions or data are shared and distributed across the network and each node has the same copy of the blockchain data. Consensus allows all network nodes to follow the same rules when validating transactions and adding new blocks to the chain, ensuring uniformity across all copies of a blockchain.
A consensus algorithm is a formal procedure or computer program for solving a consensus problem based on performing a series of specific actions. It is designed to be feasible on a network with multiple nodes. Consensus algorithms ensure that the next block in a blockchain is fully validated and secured. Currently, there are several types of consensus algorithms, each with different basic procedures. The two most popular algorithms are as follows:

- **Proof of Work (PoW)**: This consensus algorithm was introduced by Satoshi and has been widely adopted by many other blockchain systems. The PoW is the mining process aimed at finding an answer to a cryptographic hashing problem. To do this, the miner must follow the block selection rules to find the previous block and use the hash of the previous block header along with the Merkle root of the current transactions in the new block to solve the hashing problem. This requires significant computation and hashing power. Any number between 0 and 2^32 has an equal chance of solving the puzzle. The loop solution to satisfy the criteria is shown in the diagram below:

  ![pow-flowchart](https://davdifr.github.io/assets/images/pow-flowchart.svg){:style="display:block; margin-left:auto; margin-right:auto"}

  After notification, the other nodes of the network automatically check if the results are valid. If the results are valid, they add the block to their copies of the blockchain, stop the ongoing mining, and proceed to the next block.

- **Proof of Stake (PoS)**: This consensus algorithm aims to select miners based on various combinations of random choices based on miners' wealth or age (stake). Rather than miners competing with each other to solve energy-consuming cryptographic hash functions, the network will instead use a pool of validators. **Validators** are nodes (which can run on a regular laptop) that are willing to stake their cryptocurrency on the transaction blocks they claim should be added to the public blockchain. Staking makes it easier for individuals to participate in securing the network and promotes decentralization.

## Forks

A fork in the blockchain occurs when there are two different ways to proceed, and can be intentional or accidental. An intentional fork occurs when the blockchain software or rules are to be updated/changed, and an accidental fork occurs when two or more miners find a block almost simultaneously. Each time a fork occurs, miners must "choose" which direction to take, meaning each miner votes on what is the right decision for the entire chain. A fork is resolved when more blocks are added and one of the chains becomes longer than the other(s) _(Figure 4)_.

![blockchain-fork](https://davdifr.github.io/assets/images/blockchain-fork.svg){:style="display:block; margin-left:auto; margin-right:auto"}

The network abandons the blocks that are not in the longest chain (they are called orphan blocks) and continues. The blockchain works with a democratic policy, which means that it is always the majority that decides which way to go. The only way a breach can occur is if there is an attack, called a 51% attack, where the majority of nodes are compromised or choose to act maliciously.

## Ethereum

_Proposed by Vitalik Buterin in "[Ethereum: A Next-Generation Smart Contract and Decentralized Application Platform](https://ethereum.org/669c9e2e2027310b6b3cdce6e1c52962/Ethereum_Whitepaper_-_Buterin_2014.pdf)"._

Ethereum is an implementation of the blockchain and is an open source, public, and decentralized computing platform. Public means that anyone can view the account balance and transaction history of any wallet at any time by simply accessing the public Ethereum blockchain through a block explorer. Ethereum became popular thanks to the implementation of **smart contracts**.

Smart contracts are small programs (written in the Solidity language) in which developers can define the rules of the trust they intend to code. One of the most amazing features of smart contracts is their immutability.
Once implemented on the blockchain, their code cannot be changed. This immutable property makes it very difficult to program smart contracts and detect errors in advance, and that is the reason why **testnets** exist.

_Testnets are the replica of the mainnet Ethereum blockchain where developers can deploy their contracts. If the contracts work properly on testnets then they will work perfectly on the mainnet._

Ethereum also introduced the concept of world state and account. The world state includes a mapping of all accounts and their public addresses. To facilitate both state transactions and decentralized computing, Ethereum introduces two types of accounts: **Externally Owned Accounts (EOAs)**, which are controlled by private keys, and **Contract Accounts (CA)**, which are controlled by their contract code. Without CAs, Ethereum would be limited to the mere transfer of value between parties, as with Bitcoin.

---

### References

- [Bitcoin: A peer-to-peer electronic cash system](https://bitcoin.org/bitcoin.pdf)
- [https://en.bitcoin.it/wiki/Block](https://en.bitcoin.it/wiki/Block)
- [Ethereum Whitepaper](https://ethereum.org/669c9e2e2027310b6b3cdce6e1c52962/Ethereum_Whitepaper_-_Buterin_2014.pdf)
- [Mastering Blockchain Programming with Solidity](https://www.amazon.com/Mastering-Blockchain-Programming-Solidity-production-ready/dp/1839218266) - Jitendra Chittoda
- [Learn Ethereum](https://www.amazon.com/Learn-Ethereum-decentralized-applications-contracts/dp/1789954118/ref=sr_1_1?crid=1R4FU0HKYPRVR&keywords=learn+ethereum&qid=1665334863&qu=eyJxc2MiOiIwLjYyIiwicXNhIjoiMC41NyIsInFzcCI6IjAuNzcifQ%3D%3D&s=books&sprefix=learn+ethereum%2Cstripbooks-intl-ship%2C263&sr=1-1) - Xun Wu, Zhihong Zou and Dongying Song

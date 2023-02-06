---
layout: post
title: "On-chain Digital Credentials through NFTs"
date: 2023-01-11 12:57:26 +0200
categories: smartcontract eth goerli erc721 digitalcredentials
---

The proposed contract is **built on the ERC721** standard, which allows for the creation of unique, non-fungible tokens (NFTs) on the Ethereum blockchain. 

The goal of this implementation is to **create NFTs that represent digital credentials**, with all aspects of these credentials being implemented on the blockchain. 
To achieve this, a custom data structure called NFTMetadata was implemented.

```solidity
struct NFTMetadata {
  string name;
  string title;
  string description;
  address wallet;
}
```

The NFTMetadata structure contains important information about the digital credential, such as the name, title, and description of the credential. 
Additionally, it also stores the wallet address of the original recipient of the credential. 
This allows for **easy identification** of whether or not the NFT has been transferred to a different wallet and thus, whether or not the current holder is the true and original recipient of the credential. 

It is also possible to add a `referenceId` field that can be used to store the id of the certificate/credential already issued on a private storage system.
```solidity
...
string referenceId,
...
```

In this way, on-chain storage of the NFTMetadata ensures the **authenticity and integrity** of the digital credentials represented by the NFTs.

### Mapping token ID to metadata

In addition to the NFTMetadata structure, the contract also uses a mapping to associate each individual NFT with its corresponding metadata. The mapping is declared as follows:

```solidity
mapping(uint256 => NFTMetadata) public metadata;
```

This creates a mapping from token ID to NFTMetadata. 

Each NFT is identified by a **unique token ID**, which is of the type uint256. This ID is used as the key in the mapping to access the metadata associated with that particular NFT.

When a new NFT is created and minted, an entry is added to the mapping with the token ID as the key and an instance of the NFTMetadata structure as the value. This allows the contract to easily look up the metadata associated with a given NFT, simply by using its token ID as the key in the mapping.

This is how the contract links the data stored on the NFT with the metadata that allow the verification and understanding of the NFT. 

*For example if someone want to access the metadata of the NFT, with id equals to 100, it can just access the metadata[100].*

### The mint function

The mint function is a crucial part of our NFT contract, and it allows the creation of new non-fungible tokens and their assignment to a specific recipient. 

```solidity
function mint(
	string memory _name,
	string memory _title,
	string memory _description,
	address _recipient
) public onlyOwner {
	uint256 supply = totalSupply();
	uint256 tokenId = supply + 1;
	require(!paused);
	metadata[tokenId] = NFTMetadata(_name, _title, _description, _recipient);
	_safeMint(_recipient, tokenId);
}
```

First, only the contract owner has the permission to execute this function, this is achieved by using the keyword `onlyOwner`. This measure guarantees that **only authorized parties can create new NFTs**, providing a higher level of security.

The function receives four parameters: `_name`, `_title`, `_description` and `_recipient`, these parameters are used to create an instance of the NFTMetadata struct, which stores the metadata associated with the NFT, including information such as name, title and description, and the address of the recipient.

The metadata is then associated with the tokenId generated, which is calculated as the totalSupply + 1. 
This provides a **unique and incremental tokenId for each NFT minted**.

Additionally, the function contains a `require(!paused)` statement, which ensures that the creation of new NFTs can only take place when the contract is not paused, this is an important security measure. 

Finally, the function uses the `_safeMint` function, which is a helper function that guarantees that the NFT is minted and assigned to the correct recipient, avoiding security vulnerabilities.

Overall, the `mint` function is a robust and secure mechanism for creating new NFTs and assigning them to specific recipients, by using this function, we have ensured that the NFTs minted by our contract are unique, incremental, and properly assigned to their intended recipients, providing a high degree of trust and transparency.

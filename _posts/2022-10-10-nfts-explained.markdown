---
layout: post
title: "Non-Fungible Tokens explained"
date: 2022-10-10 18:01:00 +0200
categories: nfts erc721
---

A **non-fungible token** (NFT) refers to a class of blockchain-based tokens that are intended to be **unique**, as opposed to cryptocurrencies where all tokens are exchangeable. NFTs are typically used to **prove ownership** and can represent virtually any asset, whether physical or digital. However, the most common NFT assets are digital art, digital collectibles, content such as video or audio, and event tickets.

> _"NFT Art gives anyone a stake in something that they feel is significant and culturally relevant. Valuable Art is something the 1% has had a monopoly on. NFT art allows the 99% to become involved." — Kevin Godfrey, Fabriik CTO_

Nowadays the market for NFTs is growing rapidly especially in the collector sector with the trend of profile pictures (PFPs), which are attracting a lot of interest. Even major platforms like Instagram and Twitter are introducing them, which is undoubtedly remarkable. Mainstream interest in non-fungible tokens reached a fever pitch in late 2021, when the market grew 21,000% to $17.6 billion, according to [nonfungible.com](https://nonfungible.com) and [L’Atelier](https://atelier.net/). The most widely used store for buying NFTs ([OpenSea](https://opensea.io/)) saw record sales of $2 billion in January 2022 alone. The huge USD volume traded in 2022 is shown in the following pie chart by interest category:

![nfts-usd-volume](https://davdifr.github.io/assets/images/nfts-usd-volume.svg){:style="display:block; margin-left:auto; margin-right:auto"}

Some collections, such as the [Bored Ape Yacht Club](https://opensea.io/collection/boredapeyachtclub) (BAYC), have become nothing less than status symbols. Although they were originally intended as a joke, to this day they are no longer normal NFTs, and owning one of them is no less than owning a Ferrari. Steph Curry (a famous basketball player) bought the Bored Ape #7990 NFT in 2021 for $180,000. Other celebrities like Eminem, Snoop Dogg, Serena Williams, and Neymar own some of the most expensive PFPs out there, and they use them on their social networks.

The following table provides some information on 5 of the most profitable NFTs sold in Q2 2022:

|                                                NFT                                                |                                 Project                                 | Days since purchase | Purchase Price (USD) | Resale Price (USD) | Profit (USD) | Profit (%) |
| :-----------------------------------------------------------------------------------------------: | :---------------------------------------------------------------------: | :-----------------: | :------------------: | :----------------: | :----------: | :--------: |
| ![CryptoPunk #7756](https://img.seadn.io/files/5d3d2b859d0d5ab0de7e5d4359349a23.png?fit=max&w=80) |        [CryptoPunks](https://opensea.io/collection/cryptopunks)         |         583         |        $9,337        |     $3,261,857     |  3,252,519   |  34,833%   |
| ![OtherSide #59906](https://img.seadn.io/files/d002e8dfa01bf4364cd286f2b933b4cd.jpg?fit=max&w=80) |   [Otherdeed for Otherside](https://opensea.io/collection/otherdeed)    |          7          |        $5,905        |     $1,647,788     |  1,641,883   |  27,806%   |
|    ![Ape #6388](https://img.seadn.io/files/80616debe1ec357bb98e96dd2024b57d.png?fit=max&w=80)     | [Bored Ape Yacht Club](https://opensea.io/collection/boredapeyachtclub) |         377         |       $107,000       |     $1,083,512     |   $976,512   |    913%    |
|    ![Ape #7537](https://img.seadn.io/files/898e79d4a38391abf25a3ba64118980c.png?fit=max&w=80)     | [Bored Ape Yacht Club](https://opensea.io/collection/boredapeyachtclub) |         85          |       $298,001       |     $1,222,922     |   $924,921   |    310%    |
| ![Moonbirds #3904](https://img.seadn.io/files/7d858d568b20f301f61a71a0ee3e9a3f.png?fit=max&w=80)  |       [Moonbirds](https://opensea.io/collection/proof-moonbirds)        |          7          |        $7,554        |      $902,498      |   $894,944   |  11,847%   |

This kind of value enhancement is possible thanks to the great interest that NFTs experience on the Internet.
Every day, more and more companies are trying to incorporate NFTs into their marketing strategies, and this has also happened in the fashion industry. Luxury brands such as Dolce & Gabbana, Gucci, Louis Vuitton and Burberry have actively ventured into the digital space, looking for ways to incorporate NFTs into their product range and marketing efforts.

_Please note that this article isn't intended as financial advice. The previous part was intended to show and appreciate the worldwide interest in this technology, and there's no intention to suggest a financial investment._

## Technical details

For a better understanding of the following explanations, some key terms are defined here in a simplified way:

1. **Smart contract** - A smart contract is an application that runs on the blockchain. Every smart contract has some functions, some state and an address.
2. **ERCs** - ERCs (Ethereum Request for Comments) are technical documents used by smart contract developers at Ethereum. They define a set of rules required to implement tokens for the Ethereum ecosystem.
3. **Wallet Address** - A wallet address is a string of letters and numbers (`0x04600C3E...ff49628`) from which cryptocurrencies or NFTs can be sent to and from.

Ethereum was the first blockchain to support NFTs with its inheritable standard **ERC-721**. This means that developers can create new ERC-721-compliant contracts by copying a [reference implementation](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC721/ERC721.sol) that provides core methods for tracking the owner of a unique identifier and a way for the owner to transfer the asset to others.

There are many standards in Ethereum; ERC20, for example, is the most popular token standard used to create fungible tokens like coins that have economic value.

Here are some differences between the ERC20 and the ERC721 standard:

| Property    | ERC20 token standard                                                                           | ERC721 NFT standard                                                                      |
| ----------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Fungibility | Tokens are fungible up to the decimal places specified in the contract.                        | Tokens are not fungible. Each token itself represents 1 asset that cannot be subdivided. |
| Ownership   | Token ownership is not directly linked to an account, and only the token balances are tracked. | Ownership of each token is tied to an individual account address.                        |
| Uniqueness  | There is no difference in each token.                                                          | Each token is different from every other token included in the same contract.            |

The main feature of ERC-721 is that each token is unique. When an ERC-721 token is created, there is only one copy. These tokens, as NFTs, have spread the idea and application of **unique assets** on Ethereum.

The following figure _(Figure 1)_ helps to better understand what it means that ERC20 maps addresses to amounts and ERC721 maps unique IDs to owners.

![erc20-erc721](https://davdifr.github.io/assets/images/anatomy-erc20-erc721.svg){:style="display:block; margin-left:auto; margin-right:auto"}

The descriptive information of a particular ERC721 token is provided by its **metadata** and might look something like this:

```json
{
  "name": "Token #1",
  "image": "https://example.org/1.png",
  "description": "This is the token n.1"
}
```

There are two options for representing metadata: On-chain and off-chain.
In the on-chain approach, metadata is stored permanently with the token and persists beyond the lifecycle of a particular application. Moreover, they can change according to the on-chain logic. Despite these benefits, most projects store their metadata off-chain _(Figure 2)_ simply due to the current storage limitations of the Ethereum blockchain.

![off-chain-metadata](https://davdifr.github.io/assets/images/off-chain-metadata.svg){:style="display:block; margin-left:auto; margin-right:auto"}

The ERC721 standard includes (in an optional interface called ERC721Metadata) a function called `tokenURI` that developers can implement to tell applications where to find the metadata for a given item.

```solidity
function tokenURI(uint256 _tokenId) public view returns (string)
```

The function `tokenURI` returns the Uniform Resource Identifier (URI) as data type `string`. This in turn returns a JSON file that conforms to the ERC721 metadata schema.

## An in-depth insight into ERC-721

Each ERC721 token must implement nine mandatory functions and is defined as follows:

```solidity
interface ERC721 {
    event Transfer(address indexed _from, address indexed _to, uint256 indexed _tokenId);
    event Approval(address indexed _owner, address indexed _approved, uint256 indexed _tokenId);
    event ApprovalForAll(address indexed _owner, address indexed _operator, bool _approved);

    function balanceOf(address _owner) external view returns (uint256);
    function ownerOf(uint256 _tokenId) external view returns (address);
    function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes data) external payable;
    function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable;
    function transferFrom(address _from, address _to, uint256 _tokenId) external payable;
    function approve(address _approved, uint256 _tokenId) external payable;
    function setApprovalForAll(address _operator, bool _approved) external;
    function getApproved(uint256 _tokenId) external view returns (address);
    function isApprovedForAll(address _owner, address _operator) external view returns (bool);
}
```

- The `balanceOf()` function in the following code returns the total number of tokens for the specified address:

  ```solidity
  function balanceOf(address _owner) public view returns (uint256) {
  	require(owner != address(0));
  	return _ownedTokensCount[owner];
  }
  ```

  Anyone is allowed to call this function, as it is a `public` and `view` function, to read the value for off-chain calculation as well.

- The `ownerOf()` function finds the provided `tokenId` in the `_tokenOwner` map and returns the `address` of its `owner`:

  ```solidity
  function ownerOf(uint256 tokenId) public view returns (address) {
  	address owner = _tokenOwner[tokenId];
  	require(owner != address(0));
  	return owner;
  }
  ```

  If the specified `tokenId` does not exist in the mapping, `address(0)` is assigned to the local variable `owner` and the function call fails.

- The `approve()` function approves permission from another entity to transfer a token on behalf of the owner. The function requires that the sender of the message is the owner of `tokenId`. The approved token is stored in the mapping shop of `tokenApprovals`:

  ```solidity
  function approve(address to, uint256 tokenId) public {
  	address owner = ownerOf(tokenId);
  	require(to != owner);
  	require(msg.sender == owner || isApproveForAll(owner, msg.sender));

  	_tokenApprovals[tokenId] = to;
  	emit Approval(owner, to, tokenId);
  }
  ```

  The `approve()` function can also be called by the operator (who has rights to the owner's tokens). The operator can also grant approvals to another account. There are two `require` checks, the one `require(to != owner)` ensures that the operator cannot grant any other approvals to the token `owner`. The second `require` ensures that the sender is either the `owner` or has operator rights. After these checks are made, the token approval is issued to the address `to` for the specified `tokenId`. Finally, an `Approval` event is issued along with the approval data.

- The `getApproved()` function verifies and makes sure that the transaction senders are the owners of the token and that the token transfer gets approved:

  ```solidity
  function getApproved(uint256 tokenId) public view returns (address) {
  	require(_exists(tokenId));
  	return _tokenApprovals[tokenId];
  }
  ```

  The function calls an internal `_exists()` function to ensure that the given `tokenId` exists and that it has been assigned to a non-`address(0)` owner, otherwise, the function call fails.

- The `setApprovalForAll` function enables or disables the approval of a third party (`operator`) to manage all of the assets for `msg.sender`:

  ```solidity
  function setApprovalForAll(address to, bool approved) public {
  	require(to != msg.sender);
  	_operatorApprovals[msg.sender][to] = approved;
  	emit ApprovalForAll(msg.sender, to, approved);
  }
  ```

  The argument `approved` is a boolean value that specifies whether the approval should be granted or revoked.

- The `isApprovedForAll()` function checks that the given operator has operator rights on the given owner's tokens:

  ```solidity
  function isApprovedForAll(address owner, address operator) public view returns (bool) {
  	return _operatorApprovals[owner][operator];
  }
  ```

  It fetches the read-only data from the `_operatorApprovals` mapping.

- The `transferFrom()` function transfers ownership of an NFT:

  ```solidity
  function transferFrom(address from, address to, uint256 tokenId) public {
  	require(_isApprovedOrOwner(msg.sender, tokenId));
  	_transferFrom(from, to, tokenId);
  }
  ```

  The function first validates that the `msg.sender` (function caller) has the necessary permissions to transfer the given `tokenId`. Once it is verified, the internal call to the `_transferFrom()` function transfers the token from the owner's account to the recipient's account.

- The `safeTransferFrom()` function is used to safely transfer the NFT from the owner's account to the recipient's account:

  ```solidity
  function safeTransferFroom(address from, address to, uint256 tokenId, bytes memory _data) public {
  	transferFrom(from, to, tokenId);
  	require(_checkOnERC721Received(from, to, tokenId, _data));
  }
  ```

  Safely transfer here means that if the recipient is a contract, you must ensure that the "recipient contract" has registered callbacks so that the "receiver contract" gets a notification when the ERC721 token transfer is successful.

- There is another function `safeTransferFrom()` which is used when the recipient of the NFT is an **Externally Owned Account (EOA)** and not a contract account:

  ```solidity
  function safeTransferFrom(address from, address to, uint256 tokenId) public {
  	safeTransferFrom(from, to, tokenId, "");
  }
  ```

The standard interface discussed is taken from the EIP standard document at [https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md).

---

### References

- [Non-fungible token](https://en.wikipedia.org/wiki/Non-fungible_token)
- [Ethereum Improvement Proposals](https://eips.ethereum.org)
- [nonfungible.com](https://nonfungible.com) - 2022 NFT Market report Q2
- [Report: $17.6 billion in NFT trades during 2021](https://atelier.net/news/report-17.6-billion-in-nft-trades-during-2021) - L'Atelier
- [The Non-Fungible Token Bible: Everything you need to know about NFTs](https://opensea.io/blog/guides/non-fungible-tokens/) - Devin Finzer
- [Mastering Blockchain Programming with Solidity](https://www.amazon.com/Mastering-Blockchain-Programming-Solidity-production-ready/dp/1839218266) - Jitendra Chittoda
- [Learn Ethereum](https://www.amazon.com/Learn-Ethereum-decentralized-applications-contracts/dp/1789954118/ref=sr_1_1?crid=1R4FU0HKYPRVR&keywords=learn+ethereum&qid=1665334863&qu=eyJxc2MiOiIwLjYyIiwicXNhIjoiMC41NyIsInFzcCI6IjAuNzcifQ%3D%3D&s=books&sprefix=learn+ethereum%2Cstripbooks-intl-ship%2C263&sr=1-1) - Xun Wu, Zhihong Zou and Dongying Song

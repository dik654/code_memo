import { ethers , network } from "hardhat";
import { signTypedData } from "./helpers/EIP712";
import { EIP712Domain, EIP712TypeDefinition } from "./helpers/EIP712.types";
import { readFileSync } from 'fs'

async function main() {
    const [owner] = await ethers.getSigners()
    const name = "TESTCONTRACT"
    const signatureVersion = "1.0.0" 
    const chainId: number = Number(network.config.chainId)
    // typeHash struct는 알파벳 순서
    const typeHash = "BuyOrder(address maker,address taker,NFT nft,Price price,uint256 nonce,uint256 salt,Fee[] fees,uint256 orderExpiry,Metadata metadata)Fee(uint16 rate,address recipient)Metadata(bytes32 metadataHash,address checker)NFT(address token,uint256 tokenId)Price(address paymentToken,uint256 price)"
    const argumentTypeHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(typeHash));
    const types: EIP712TypeDefinition = {
        // struct BuyOrder {
        //     address maker;
        //     address taker; //private order
        //     NFT nft;
        //     Price price;
        //     uint256 nonce;
        //     uint256 salt;
        //     Fee[] fees;
        //     uint256 orderExpiry;
        //     Metadata metadata;
        // }
        BuyOrder: [
            { name: "maker", type: "address" },
            { name: "taker", type: "address" },
            { name: "nft", type: "NFT" },
            { name: "price", type: "Price" },
            { name: "nonce", type: "uint256" },
            { name: "salt", type: "uint256" },
            { name: "fees", type: "Fee[]" },
            { name: "orderExpiry", type: "uint256" },
            { name: "metadataHash", type: "bytes32" },
        ],
        Fee: [
            { name: "rate", type: "uint16" },
            { name: "recipient", type: "address"},
        ],
        NFT: [
            { name: "token", type: "address" },
            { name: "tokenId", type: "uint256" },
        ],
        Price: [
            { name: "paymentToken", type: "address"},
            { name: "price", type: "uint256"}
        ]
    }
    const verifyingContract = readFileSync(__dirname + '/.proxy-contract', 'utf8').toString();
    const domain: EIP712Domain = {
        name: name,
        version: signatureVersion,
        chainId: chainId,
        verifyingContract: verifyingContract
    }
    const buyOrder = {
        maker: "0x6f1ad6cDF01ce9F4AADB37490Ca3eC5e2616c65D",
        taker: "0x89d01461eB2da0348AcBb2DA306aFA8f19657802",
        nft: {
            token: "0xeCFCec4F0b64Bf3f52E9A36f8496690aB3112584",
            tokenId: 0
        },
        price: {
            paymentToken: "0xE33a7f20c7a8Afa5d091b3e67216c50055afD576",
            price: 100
        },
        nonce: 0,
        salt: 1234,
        fees: [{
            rate: 10,
            recipient: "0x6f1ad6cDF01ce9F4AADB37490Ca3eC5e2616c65D"
        }],
        orderExpiry: 1896927620,
        metadataHash: "0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658"
    }
    const signature = await signTypedData(domain, types, buyOrder, owner);
    console.log("signature" + signature);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
  

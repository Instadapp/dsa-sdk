require('dotenv').config()
const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ETH_NODE_URL))

const DSA = require("../src/index");
const dsa = new DSA({
    web3: web3,
    mode: "node",
    privateKey: process.env.PRIVATE_KEY,
    publicAddress: process.env.PUBLIC_ADDRESS
});
// const walletAddress = '0x981C549A74Dc36Bd82fEd9097Bc19404E8db14f3';

// dsa.internal.getAddress().then(console.log)

// Test 0
// dsa.build().then(console.log).catch(console.log)

// // Test 1
// let spells = dsa.Spell();
// let borrowAmount = 0.01; // 20 DAI
// let borrowAmtInWei = dsa.tokens.fromDecimal(borrowAmount, "dai"); // borrow flash loan and swap via Oasis

// // Test 2
// dsa.instance.address = walletAddress
// spells.add({
//       connector: "basic",
//       method: "withdraw",
//       args: [dsa.tokens.info["dai"].address, borrowAmtInWei, dsa.internal.getAddress(), 0, 0]
//     });
// dsa.cast(spells).then(console.log).catch(console.error)

// // Test 3
// dsa.instance.address = walletAddress
// dsa.erc20.transfer({
//     token: "dai",
//     amount: "100000"
// }).then(console.log).catch(console.error)

// // Test 4
// dsa.instance.address = walletAddress
// dsa.erc20.transfer({
//     token: "eth",
//     amount: "100000"
// }).then(console.log).catch(console.error)
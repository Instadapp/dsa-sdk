require('dotenv').config()
const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ETH_NODE_URL))

const DSA = require("../src/index");
const dsa = new DSA(web3);
const walletAddress = '0x981C549A74Dc36Bd82fEd9097Bc19404E8db14f3';


// dsa.count().then(console.log)
// console.log(dsa.tokens.info);
// console.log(
//     dsa.compound.ctokenMap("CETH")
// )
// console.log(dsa.compound.getCtokens())
// dsa.maker.getVaults(walletAddress).then(console.log)
// dsa.maker.getCollateralInfo().then(console.log)
// dsa.compound.getPosition(walletAddress, "token").then(console.log)
// dsa.balances.getBalances(walletAddress).then(console.log)
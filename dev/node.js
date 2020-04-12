require('dotenv').config()
const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ETH_NODE_URL))

const DSA = require("../src/index");
const dsa = new DSA(web3);

// dsa.count().then(console.log)
// console.log(dsa.tokens.info);
// console.log(dsa.compound.ctokenMap("CETH"))
// dsa.maker.getVaults("0x981C549A74Dc36Bd82fEd9097Bc19404E8db14f3").then(console.log)
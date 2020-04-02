module.exports.address = {
  genesis: "0x0000000000000000000000000000000000000000",
  core: {
    index: "0x2971AdFa57b20E5a416aE5a708A8655A9c74f723",
    list: "0x4c8a1BEb8a87765788946D6B19C6C6355194AbEb",
  },
  connectors: {
    basic: "0x9370236a085A99Aa359f4bD2f0424b8c3bf25C99",
    auth: "0x627cd0DbD5eE33F8456Aa8143aCd68a13d641588",
    compound: "",
  },
  resolvers: {
    core: "0xD6fB4fd8b595d0A1dE727C35fe6F1D4aE5B60F51",
  },
};

module.exports.ABI = {
  core: {
    index: require("./abi/core/index.json"),
    list: require("./abi/core/list.json"),
    account: require("./abi/core/account.json"),
  },
  resolvers: {
    core: require("./abi/resolvers/core.json"),
  },
  connectors: {
    basic: require("./abi/connectors/basic.json"),
    auth: require("./abi/connectors/auth.json"),
    compound: require("./abi/connectors/compound.json"),
  },
};

module.exports.token = {
  eth: {
    symbol: "ETH",
    name: "Ethereum",
    address: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
    decimals: 18,
  },
  dai: {
    symbol: "DAI",
    name: "DAI Stable",
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    decimals: 18,
  },
  usdc: {
    symbol: "USDC",
    name: "USD Coin",
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    decimals: 6,
  },
  sai: {
    symbol: "SAI",
    name: "SAI Stable",
    address: "0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359",
    decimals: 18,
  },
  mkr: {
    symbol: "MKR",
    name: "MakerDAO",
    address: "0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2",
    decimals: 18,
  },
  zrx: {
    symbol: "ZRX",
    name: "0x Protocol",
    address: "0xe41d2489571d322189246dafa5ebde1f4699f498",
    decimals: 18,
  },
  rep: {
    symbol: "REP",
    name: "Augur",
    address: "0x1985365e9f78359a9b6ad760e32412f4a445e862",
    decimals: 18,
  },
  tusd: {
    symbol: "TUSD",
    name: "TrueUSD",
    address: "0x8dd5fbCe2F6a956C3022bA3663759011Dd51e73E",
    decimals: 18,
  },
  bat: {
    symbol: "BAT",
    name: "Basic Att.",
    address: "0x0d8775f648430679a709e98d2b0cb6250d2887ef",
    decimals: 18,
  },
  knc: {
    symbol: "KNC",
    name: "Kyber Network",
    address: "0xdd974d5c2e2928dea5f71b9825b8b646686bd200",
    decimals: 18,
  },
  wbtc: {
    symbol: "WBTC",
    name: "Wrapped BTC",
    address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    decimals: 8,
  },
};

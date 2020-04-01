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

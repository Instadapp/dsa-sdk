module.exports.address = {
  genesis: "0x0000000000000000000000000000000000000000",
  core: {
    index: "0x2971AdFa57b20E5a416aE5a708A8655A9c74f723",
    list: "0x4c8a1BEb8a87765788946D6B19C6C6355194AbEb",
  },
  resolver: {
    core: "0xD6fB4fd8b595d0A1dE727C35fe6F1D4aE5B60F51",
  },
};

module.exports.ABI = {
  INDEX_CORE: require("./abi/core/index.json"),
  LIST_CORE: require("./abi/core/list.json"),
  CORE_RESOLVER: require("./abi/resolvers/core.json"),
};
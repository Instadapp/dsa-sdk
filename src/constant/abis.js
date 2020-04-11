module.exports = {
  core: {
    index: require("../abi/core/index.json"),
    list: require("../abi/core/list.json"),
    account: require("../abi/core/account.json"),
    connector: require("../abi/core/connector.json"),
    events: require("../abi/core/events.json"),
  },
  resolvers: {
    core: require("../abi/resolvers/core.json"),
    compound: require("../abi/read/compound.json"),
    maker: require("../abi/read/maker.json"),
    balances: require("../abi/read/balances.json"),
  },
  connectors: {
    basic: require("../abi/connectors/basic.json"),
    auth: require("../abi/connectors/auth.json"),
    compound: require("../abi/connectors/compound.json"),
    maker: require("../abi/connectors/maker.json"),
  },
  read: {
    core: require("../abi/resolvers/core.json"),
    compound: require("../abi/read/compound.json"),
    maker: require("../abi/read/maker.json"),
    balances: require("../abi/read/balances.json"),
  },
};

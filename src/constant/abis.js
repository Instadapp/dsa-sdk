module.exports = {
  core: {
    index: require("../abi/core/index.json"),
    list: require("../abi/core/list.json"),
    account: require("../abi/core/account.json"),
    connector: require("../abi/core/connector.json"),
    events: require("../abi/core/events.json"),
  },
  connectors: {
    basic: require("../abi/connectors/basic.json"),
    auth: require("../abi/connectors/auth.json"),
    authority: require("../abi/connectors/auth.json"), // same json file as of "auth" to not break things with upgrade
    compound: require("../abi/connectors/compound.json"),
    maker: require("../abi/connectors/maker.json"),
    instapool: require("../abi/connectors/instapool.json"),
    oasis: require("../abi/connectors/oasis.json"),
    kyber: require("../abi/connectors/kyber.json"),
    curve: require("../abi/connectors/curve.json"),
    oneInch: require("../abi/connectors/1inch.json"),
    dydx: require("../abi/connectors/dydx.json"),
    aave: require("../abi/connectors/aave.json"),
    migrate: require("../abi/connectors/migrate.json"),
  },
  read: {
    core: require("../abi/read/core.json"),
    compound: require("../abi/read/compound.json"),
    maker: require("../abi/read/maker.json"),
    balances: require("../abi/read/balances.json"),
    oasis: require("../abi/read/oasis.json"),
    kyber: require("../abi/read/kyber.json"),
    curve: require("../abi/read/curve.json"),
    oneInch: require("../abi/read/1inch.json"),
    dydx: require("../abi/read/dydx.json"),
    aave: require("../abi/read/aave.json"),
  },
  basic: {
    erc20: require("../abi/basics/erc20.json"),
  },
};

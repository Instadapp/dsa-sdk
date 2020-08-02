import Web3 from "web3";

export const sameAddress = (firstAddress, secondAddress) => {
  if (!firstAddress) {
    return false;
  }

  if (!secondAddress) {
    return false;
  }

  return firstAddress.toLowerCase() === secondAddress.toLowerCase();
};

export const ETHEREUM_NETWORK = {
  MAINNET: "MAINNET",
  MORDEN: "MORDEN",
  ROPSTEN: "ROPSTEN",
  RINKEBY: "RINKEBY",
  GOERLI: "GOERLI",
  KOVAN: "KOVAN",
  UNKNOWN: "UNKNOWN",
};

export const WALLET_PROVIDER = {
  SAFE: "SAFE",
  METAMASK: "METAMASK",
  REMOTE: "REMOTE",
  TORUS: "TORUS",
  PORTIS: "PORTIS",
  FORTMATIC: "FORTMATIC",
  SQUARELINK: "SQUARELINK",
  UNILOGIN: "UNILOGIN",
  WALLETCONNECT: "WALLETCONNECT",
  OPERA: "OPERA",
  DAPPER: "DAPPER",
  WALLETLINK: "WALLETLINK",
  AUTHEREUM: "AUTHEREUM",
  LEDGER: "LEDGER",
  TREZOR: "TREZOR",
};

export const ETHEREUM_NETWORK_IDS = {
  1: ETHEREUM_NETWORK.MAINNET,
  2: ETHEREUM_NETWORK.MORDEN,
  3: ETHEREUM_NETWORK.ROPSTEN,
  4: ETHEREUM_NETWORK.RINKEBY,
  5: ETHEREUM_NETWORK.GOERLI,
  42: ETHEREUM_NETWORK.KOVAN,
};

// With some wallets from web3connect you have to use their provider instance only for signing
// And our own one to fetch data
export const web3ReadOnly =
  process.env.NODE_ENV !== "test"
    ? new Web3(new Web3.providers.HttpProvider(process.env.ETH_NODE_URL))
    : new Web3(window.web3.currentProvider || "ws://localhost:8545");

let web3 = web3ReadOnly;
export const getWeb3 = () => web3;

export const resetWeb3 = () => {
  web3 = web3ReadOnly;
};

export const getAccountFrom = async () => {
  const accounts = await web3.eth.getAccounts();

  if (process.env.NODE_ENV === "test" && window.testAccountIndex) {
    return accounts[window.testAccountIndex];
  }

  return accounts && accounts.length > 0 ? accounts[0] : null;
};

export const getNetworkIdFrom = () => web3.eth.net.getId();

const isHardwareWallet = (walletName) =>
  sameAddress(WALLET_PROVIDER.LEDGER, walletName) ||
  sameAddress(WALLET_PROVIDER.TREZOR, walletName);

const isSmartContractWallet = async (account) => {
  const contractCode = await web3.eth.getCode(account);

  return contractCode.replace("0x", "").replace(/0/g, "") !== "";
};

export const getProviderInfo = async (providerName = "Wallet") => {
  const account = await getAccountFrom();
  const network = await getNetworkIdFrom();
  const smartContractWallet = await isSmartContractWallet(account);
  const hardwareWallet = isHardwareWallet(providerName);

  const available = account !== null;

  return {
    name: providerName,
    available,
    loaded: true,
    account,
    network,
    smartContractWallet,
    hardwareWallet,
  };
};

export const setWeb3 = (provider) => {
  web3 = new Web3(provider);
};

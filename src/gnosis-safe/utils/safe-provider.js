module.exports = class GnosisSafeWeb3 {
  constructor(_dsa) {
    this.internal = _dsa.internal;
    this.web3 = _dsa.web3;
    this.WALLET_PROVIDER = {
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
  }

  sameAddress(firstAddress, secondAddress) {
    if (!firstAddress) {
      return false;
    }

    if (!secondAddress) {
      return false;
    }

    return firstAddress.toLowerCase() === secondAddress.toLowerCase();
  }

  isHardwareWallet(walletName) {
    return (
      this.sameAddress(this.WALLET_PROVIDER.LEDGER, walletName) ||
      this.sameAddress(this.WALLET_PROVIDER.TREZOR, walletName)
    );
  }

  async isSmartContractWallet(account) {
    const contractCode = await web3.eth.getCode(account);

    return contractCode.replace("0x", "").replace(/0/g, "") !== "";
  }

  async getProviderInfo(fromAddr, providerName = "Wallet") {
    const account = fromAddr ? fromAddr : await this.internal.getAddress();
    const smartContractWallet = await this.isSmartContractWallet(account);
    const hardwareWallet = this.isHardwareWallet(providerName);

    return {
      smartContractWallet,
      hardwareWallet,
    };
  }
};

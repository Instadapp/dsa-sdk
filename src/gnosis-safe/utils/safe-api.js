const axios = require("axios");

module.exports = class APIHelpers {
  constructor(_dsa) {
    this.web3 = _dsa.web3;
    this.internal = _dsa.internal;
    this.TX_SERVICE_HOST = "tsh";
    this.SIGNATURES_VIA_METAMASK = "svm";
    this.config = {
      [this.TX_SERVICE_HOST]:
        "https://safe-transaction.mainnet.gnosis.io/api/v1/",
    };
  }

  getTxServiceHost() {
    return this.config[this.TX_SERVICE_HOST];
  }

  getTxServiceUriFrom(safeAddress) {
    return `safes/${safeAddress}/transactions/`;
  }

  getSafeUriFrom(safeAddress) {
    return `safes/${safeAddress}/`;
  }

  getOwnersUriFrom(ownerAddress) {
    return `owners/${ownerAddress}/`;
  }

  getIncomingTxServiceUriTo(safeAddress) {
    return `safes/${safeAddress}/incoming-transfers/`;
  }

  getSafeCreationTxUri(safeAddress) {
    return `safes/${safeAddress}/creation/`;
  }

  signaturesViaMetamask() {
    return this.config[SIGNATURES_VIA_METAMASK];
  }

  async getSafeAddresses(address) {
    let _addr = address ? address : await this.internal.getAddress();
    if (!_addr) throw new Error("Error getting account address");
    _addr = this.web3.utils.toChecksumAddress(_addr);
    const host = this.getTxServiceHost();
    const base = this.getOwnersUriFrom(_addr);
    const url = `${host}${base}`;
    const response = await axios.get(url);
    const SUCCESS_STATUS = 200;
    if (response.status !== SUCCESS_STATUS) {
      return Promise.reject(new Error("Error getting safe addresses"));
    } else {
      return response.data.safes;
    }
  }

  async getSafeOwners(safeAddress) {
    let _addr = safeAddress;
    if (!_addr) throw new Error("`safeAddress` is not defined.");
    _addr = this.web3.utils.toChecksumAddress(_addr);
    const host = this.getTxServiceHost();
    const base = this.getSafeUriFrom(_addr);
    const url = `${host}${base}`;
    const response = await axios.get(url);
    const SUCCESS_STATUS = 200;
    if (response.status !== SUCCESS_STATUS) {
      return Promise.reject(new Error("Error getting safe addresses"));
    } else {
      return response.data.owners;
    }
  }

  async calculateBodyFrom(
    safeInstance,
    to,
    valueInWei,
    data,
    operation,
    nonce,
    safeTxGas,
    baseGas,
    gasPrice,
    gasToken,
    refundReceiver,
    transactionHash,
    sender,
    origin,
    signature
  ) {
    const contractTransactionHash = await safeInstance.methods
      .getTransactionHash(
        to,
        valueInWei,
        data,
        operation,
        safeTxGas,
        baseGas,
        gasPrice,
        gasToken,
        refundReceiver,
        nonce
      )
      .call();

    const web3 = this.web3;
    return {
      to: web3.utils.toChecksumAddress(to),
      value: valueInWei,
      data,
      operation,
      nonce,
      safeTxGas,
      baseGas,
      gasPrice,
      gasToken,
      refundReceiver,
      contractTransactionHash,
      transactionHash,
      sender: web3.utils.toChecksumAddress(sender),
      origin,
      signature,
    };
  }

  async buildTxServiceUrl(safeAddress) {
    const host = this.getTxServiceHost();
    const address = this.web3.utils.toChecksumAddress(safeAddress);
    const base = this.getTxServiceUriFrom(address);
    return `${host}${base}?has_confirmations=True`;
  }

  async saveTxToHistory({
    baseGas,
    data,
    gasPrice,
    gasToken,
    nonce,
    operation,
    origin,
    refundReceiver,
    safeInstance,
    safeTxGas,
    sender,
    signature,
    to,
    txHash,
    valueInWei,
  }) {
    const url = await this.buildTxServiceUrl(safeInstance._address);
    const body = await this.calculateBodyFrom(
      safeInstance,
      to,
      valueInWei,
      data,
      operation,
      nonce,
      safeTxGas,
      baseGas,
      gasPrice,
      gasToken,
      refundReceiver,
      txHash || null,
      sender,
      origin || null,
      signature
    );
    const response = await axios.post(url, body);
    const SUCCESS_STATUS = 201; // CREATED status

    if (response.status !== SUCCESS_STATUS) {
      return Promise.reject(new Error("Error submitting the transaction"));
    }

    return Promise.resolve();
  }
};

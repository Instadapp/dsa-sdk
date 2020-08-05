const axios = require("axios");
const { createTransaction } = require("./transactions/createTransaction");
// const {
//   MULTI_SEND_ADDRESS,
//   getEncodedMultiSendCallData,
// } = require("./contracts/safeContracts");
const { DELEGATE_CALL } = require("./transactions/send");
const {
  TX_NOTIFICATION_TYPES,
} = require("./transactions/notifiedTransactions");
const { setWeb3 } = require("./getWeb3");
const {getTxServiceHost, getOwnersUriFrom} = require("./config")

module.exports = class GnosisSafe {
  constructor(_dsa) {
    this.ABI = _dsa.ABI;
    this.tokens = _dsa.tokens;
    this.math = _dsa.math;
    this.internal = _dsa.internal;
    this.web3 = _dsa.web3;
    this.dsa = _dsa;

    setWeb3(this.web3.currentProvider);
  }

  setInstance(_o) {
    let _safeAddress;
    if (typeof _o == "object") {
      if (!_o.safeAddress) throw new Error("`safeAddress` is not defined.");
      _safeAddress = _o.safeAddress;
    } else {
      _safeAddress = _o;
    }

    this.safeAddress = _safeAddress;
  }

  async getSafeAddress(){
    const host = getTxServiceHost();
    const _addr = await this.internal.getAddress();
    if(!_addr) throw new Error("Error getting account address");
    const base = getOwnersUriFrom(_addr)
    const url = `${host}${base}`;
    const response = await axios.get(url);
    const SUCCESS_STATUS = 200;
    if (response.status !== SUCCESS_STATUS) {
      return Promise.reject(new Error("Error getting safe addresses"));
    }else{
      return response.data.safes[0];
    }
  }

  // send transaction with MultiSend
  /*
  sendTransactions(safeAddress, txs, origin) {
    const encodeMultiSendCallData = getEncodedMultiSendCallData(txs);

    return createTransaction({
      safeAddress,
      to: MULTI_SEND_ADDRESS,
      valueInWei: "0",
      txData: encodeMultiSendCallData,
      notifiedTransaction: TX_NOTIFICATION_TYPES.STANDARD_TX,
      operation: DELEGATE_CALL,
      origin,
    });
  }
  */

  submitTx = async (tx) => {
    const web3 = this.web3;
    const safeAddress = this.safeAddress ? this.safeAddress : await getSafeAddress();
    if(!safeAddress)
      return Promise.reject(new Error("Error getting safe addresses"));
    const txRecipient = tx.contractAddress;
    const txData = tx.data ? tx.data.trim() : "0x";
    const txValue = tx.value ? web3.utils.toWei(tx.value, "ether") : "0";

    createTransaction({
      safeAddress,
      to: txRecipient,
      valueInWei: txValue,
      txData,
      notifiedTransaction: TX_NOTIFICATION_TYPES.STANDARD_TX,
    });
  };
};

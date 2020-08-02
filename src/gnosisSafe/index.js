const { createTransaction } = require("./transactions/createTransaction");
const {
  MULTI_SEND_ADDRESS,
  getEncodedMultiSendCallData,
} = require("./contracts/safeContracts");
const { DELEGATE_CALL } = require("./transactions/send");
const {
  TX_NOTIFICATION_TYPES,
} = require("./transactions/notifiedTransactions");
const { setWeb3 } = require("./getWeb3");

module.exports = class GnosisSafe {
  constructor(_dsa) {
    this.ABI = _dsa.ABI;
    this.tokens = _dsa.tokens;
    this.math = _dsa.math;
    this.internal = _dsa.internal;
    this.web3 = _dsa.web3;
    this.dsa = _dsa;
    this.safeAddress = _dsa.address.genesis;
    setWeb3(this.web3.currentProvider);
  }

  /**
   * sets the current GnosisSafe instance
   */
  async setInstance(_o) {
    let _safeAddress;
    if (typeof _o == "object") {
      if (!_o.safeAddress) throw new Error("`safeAddress` is not defined.");
      _safeAddress = _o.safeAddress;
    } else {
      _safeAddress = _o;
    }

    this.safeAddress = _safeAddress;
  }

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

  submitTx = async (tx) => {
    const web3 = this.web3;
    const safeAddress = this.safeAddress;
    const txRecipient = tx.contractAddress;
    const txData = tx.data ? tx.data.trim() : "";
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

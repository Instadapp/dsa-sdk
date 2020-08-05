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
    this.instance = _dsa.instance;
    this.origin = _dsa.origin

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

  /**
   * submit transaction with all the spells
   * @param _d the spells instance
   * OR
   * @param _d.spells the spells instance
   * @param _d.origin (optional)
   * @param _d.to (optional)
   * @param _d.from (optional)
   * @param _d.value (optional)
   * @param _d.gasPrice (optional only for "browser" mode)
   * @param _d.gas (optional)
   * @param {number|string} _d.nonce (optional) txn nonce (mostly for node implementation)
   */
  submitTx = async (_d) => {
    const web3 = this.web3;
    const safeAddress = this.safeAddress ? this.safeAddress : await this.getSafeAddress();
    if(!safeAddress)
      return Promise.reject(new Error("Error getting safe addresses"));
    const _addr = await this.internal.getAddress();
    const _espell = this.internal.encodeSpells(_d);
    if (!_d.to) _d.to = this.instance.address;
    if (!_d.from) _d.from = _addr;
    if (!_d.origin) _d.origin = this.origin;
    if(_d.to === _d.origin)
      return Promise.reject(new Error("Please set DSA instance first"));

    let _c = new web3.eth.Contract(
      this.ABI.core.account,
      this.instance.address
    );

    _d.callData = _c.methods.cast(..._espell, _d.origin).encodeABI();

    let txObj = await this.internal.getTxObj(_d);

    createTransaction({
      safeAddress,
      to: txObj.to,
      valueInWei: txObj.value,
      txData: txObj.data,
      notifiedTransaction: TX_NOTIFICATION_TYPES.STANDARD_TX,
    });
  };
};

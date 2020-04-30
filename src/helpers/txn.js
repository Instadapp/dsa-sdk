/**
 * txn helpers
 */
module.exports = class TxnHelper {
  /**
   * @param {Object} _dsa the dsa instance to access data stores
   */
  constructor(_dsa) {
    this.ABI = _dsa.ABI;
    this.internal = _dsa.internal;
    this.web3 = _dsa.web3;
    this.mode = _dsa.mode;
    this.privateKey = _dsa.privateKey;
  }

  /**
   * to send transaction functions and get raw data return
   */
  async send(_h) {
    return new Promise((resolve, reject) => {
      if (this.mode == "node") {
        this.web3.eth.accounts
          .signTransaction(_h, this.privateKey)
          .then((rawTx) => {
            this.web3.eth
              .sendSignedTransaction(rawTx.rawTransaction)
              .on("transactionHash", (txHash) => {
                resolve(txHash);
              })
              .on("error", function (error) {
                reject(error);
              });
          });
      } else {
        this.web3.eth
          .sendTransaction(_h)
          .on("transactionHash", (txHash) => {
            resolve(txHash);
          })
          .on("error", function (error) {
            reject(error);
          });
      }
    });
  }
};

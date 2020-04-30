/**
 * txn helpers
 */
module.exports = class TxnHelper {
  
  /**
   * @param {Object} dsa the dsa instance to access data stores
   */
  constructor(dsa) {
    this.ABI = dsa.ABI;
    this.internal = dsa.internal;
    this.web3 = dsa.web3;
    this.mode = dsa.mode;
    this.privateKey = dsa.privateKey
  }

  /**
   * to send transaction functions and get raw data return
   */
  async send(_h) {
    return new Promise((resolve, reject) => {
      this.web3.eth.getTransactionCount(_h.from).then((txCount) => {
        _h.nonce = txCount + this.internal.nonce;
        // _h.to = _h.from // For testing
        // delete _h.data; // For testing
        if (this.mode == "node") {
          this.web3.eth.accounts
            .signTransaction(_h, this.privateKey)
            .then((rawTx) => {
              this.web3.eth
                .sendSignedTransaction(rawTx.rawTransaction)
                .on("transactionHash", (txHash) => {
                  this.internal.nonce++;
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
              this.internal.nonce++;
              resolve(txHash);
            })
            .on("error", function (error) {
              reject(error);
            });
        }
      });
    });
  }

}
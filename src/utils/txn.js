/**
 * txn helpers
 */
module.exports = class TxnHelper {
  /**
   * @param {Object} _dsa the dsa instance to access data stores
   */
  constructor(_dsa) {
    this.ABI = _dsa.ABI;
    this.address = _dsa.address;
    this.internal = _dsa.internal;
    this.web3 = _dsa.web3;
    this.mode = _dsa.mode;
    this.privateKey = _dsa.privateKey;
    this.dsa = _dsa;
  }

  /**
   * to send transaction functions and get raw data return
   */
  async send(_h) {
    return new Promise((resolve, reject) => {
      if (_h.to == this.address.genesis)
        return reject(
          `Please configure the DSA instance by calling dsa.setInstance(dsaId). More details: https://docs.instadapp.io/setup`
        );
      if (this.mode == "node") {
        this.web3.eth.accounts
          .signTransaction(_h, this.privateKey)
          .then((rawTx) => {
            this.web3.eth
              .sendSignedTransaction(rawTx.rawTransaction)
              .on("transactionHash", (txHash) => {
                resolve(txHash);
              })
              .on("error", (error) => {
                reject(error);
              });
          });
      } else {
        this.web3.eth
          .sendTransaction(_h)
          .on("transactionHash", (txHash) => {
            resolve(txHash);
          })
          .on("error", (error) => {
            reject(error);
          });
      }
    });
  }

  /**
   * Cancel transaction.
   * @param {number} _h.nonce - transaction hash.
   * @param {number} _h.gasPrice - transaction hash.
   * @returns {String} transaction hash.
   */
  async cancel(_h) {
    if (!_h.nonce) reject("'nonce` not defined.");
    if (!_h.gasPrice) reject("'gasPrice` not defined.");
    return new Promise(async (resolve, reject) => {
      let _userAddr = await this.internal.getAddress();
      let _txObj = {
        from: _userAddr,
        to: _userAddr,
        value: 0,
        data: "0x",
        gasPrice: _h.gasPrice,
        gas: "27500",
        nonce: _h.nonce,
      };
      await this.send(_txObj)
        .then((data) => resolve(data))
        .catch((err) => reject(err));
    });
  }

  /**
   * Speed up transaction.
   * @param {String} _h.txHash - transaction hash.
   * @param {number} _h.gasPrice - transaction hash.
   * @returns {String} transaction hash.
   */
  async speedUp(_h) {
    return new Promise(async (resolve, reject) => {
      let _userAddr = await this.internal.getAddress();
      if (!_h.txHash) reject("'txHash` not defined.");
      if (!_h.gasPrice) reject("'gasPrice` not defined.");
      this.web3.eth
        .getTransaction(_h.txHash)
        .then(async (txData) => {
          if (txData.from.toLowerCase() != _userAddr.toLowerCase())
            reject("'from' address doesnt match.");
          let _txObj = {
            from: txData.from,
            to: txData.to,
            value: txData.value,
            data: txData.input,
            gasPrice: _h.gasPrice.toFixed(0),
            gas: txData.gas,
            nonce: txData.nonce,
          };
          await this.send(_txObj)
            .then((data) => resolve(data))
            .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
    });
  }

  /**
   * Get transaction Nonce.
   * @param {string} tx - transaction hash to get nonce.
   */
  async getTxNonce(tx) {
    return new Promise(async (resolve, reject) => {
      this.web3.eth
        .getTransaction(tx)
        .then((_tx) => resolve(_tx.nonce))
        .catch((err) => reject(err));
    });
  }

  /**
   * Get transaction count.
   * @param {address} address - transaction count of address.
   */
  async getTxCount(address) {
    return new Promise(async (resolve, reject) => {
      this.web3.eth
        .getTransactionCount(address)
        .then((nonce) => resolve(nonce))
        .catch((err) => reject(err));
    });
  }
};

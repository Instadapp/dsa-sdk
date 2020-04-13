module.exports = class Token {
  /**
   * @param {Object} _dsa the dsa instance to access data stores
   */
  constructor(_dsa) {
    this.ABI = _dsa.ABI;
    this.tokens = _dsa.tokens;
    this.helpers = _dsa.helpers;
    this.internal = _dsa.internal;
    this.web3 = _dsa.web3;
  }

  /**
   * Transfer
   * @param {symbol} _d.token
   * @param {number|string} _d.amount
   * @param {address} _d.to
   * @param {address} _d.from (optional)
   * @param {number|string} _d.gasPrice (optional)
   * @param {number|string} _d.gas (optional)
   */
    async transfer(_d) {
        let _addr = await this.internal.getAddress();
        let web3 = this.web3;
        var token = this.tokens.info[_d.token.toLowerCase()];
        if (!_d.from) _d.from = _addr;
        _d.amount = this.helpers.bigNumInString((_d.amount*10**token.decimals).toFixed(0));
        if (_d.token.toLowerCase() == "eth") {
            return new Promise((resolve, reject) => {
                return web3.eth.sendTransaction({from: _d.from, to: _d.to, value: _d.amount})
                .on("transactionHash", (txHash) => {
                    resolve(txHash);
                })
                .on("error", (err) => {
                    reject(err);
                });
            });
        } else {
            var _c = await new web3.eth.Contract(this.ABI.basic.erc20, token.address);
            return new Promise((resolve, reject) => {
                return _c.methods
                    .transfer(_d.to, _d.amount)
                    .send(_d)
                    .on("transactionHash", (txHash) => {
                    resolve(txHash);
                    })
                    .on("error", (err) => {
                    reject(err);
                });
            });
        }
    }

   /**
   * Approve Token
   * @param {symbol} _d.token
   * @param {number|string} _d.amount
   * @param {address} _d.to
   * @param {address} _d.from (optional)
   * @param {number|string} _d.gasPrice (optional)
   * @param {number|string} _d.gas (optional)
   */
    async approve(_d) {
        let _addr = await this.internal.getAddress();
        let web3 = this.web3;
        var token = this.tokens.info[_d.token.toLowerCase()];
        if (!_d.from) _d.from = _addr;
        _d.amount = this.helpers.bigNumInString((_d.amount*10**token.decimals).toFixed(0));

        if (_d.token.toLowerCase() == "eth") {
            return new Promise((resolve, reject) => {resolve("ETH does not require approve.")})
        } else {
            var _c = await new web3.eth.Contract(this.ABI.basic.erc20, token.address);
            return new Promise((resolve, reject) => {
                return _c.methods
                    .approve(_d.to, _d.amount)
                    .send(_d)
                    .on("transactionHash", (txHash) => {
                    resolve(txHash);
                    })
                    .on("error", (err) => {
                    reject(err);
                });
            });
        }
        
    }
};

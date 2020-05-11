module.exports = class OneInch {
  /**
   * @param {Object} _dsa the dsa instance to access data stores
   */
  constructor(_dsa) {
    this.ABI = _dsa.ABI;
    this.address = _dsa.address;
    this.tokens = _dsa.tokens;
    this.web3 = _dsa.web3;
    this.instance = _dsa.instance;
    this.helpers = _dsa.helpers;
    this.dsa = _dsa;
  }

  /**
   * returns buy/dest amount and unit Amount
   * @param buyToken buy token symbol
   * @param sellToken sell token symbol
   * @param sellAmt sell token amount in decimal
   * @param slippage slippage of trade
   */
  async getBuyAmount(buyToken, sellToken, sellAmt, slippage, distribution, disableDex) {
    let _slippage = !slippage ? 10 ** 16 : slippage * 10 ** 16;
    _slippage = String(this.helpers.bigNumInString(_slippage));
    let _distribution = !distribution ? 3 : distribution;
    let _disableDex = !disableDex ? 0 : disableDex;

    var _obj = {
      protocol: "oneInch",
      method: "getBuyAmount",
      args: [
        this.tokens.info[buyToken.toLowerCase()].address,
        this.tokens.info[sellToken.toLowerCase()].address,
        this.tokens.fromDecimal(sellAmt, sellToken),
        this.helpers.bigNumInString(_slippage),
        this.helpers.bigNumInString(_distribution),
        this.helpers.bigNumInString(_disableDex)
      ],
    };
    return new Promise((resolve, reject) => {
      return this.dsa
        .read(_obj)
        .then((res) => {
          var _res = {
            buyAmt: this.tokens.toDecimal(res[0], buyToken),
            buyAmtRaw: res[0],
            unitAmt: res[1],
            distribution: res[2]
          };
          resolve(_res);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
};

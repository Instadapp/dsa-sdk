module.exports = class InstaPool {
  /**
   * @param {Object} _dsa the dsa instance to access data stores
   */
  constructor(_dsa) {
    this.web3 = _dsa.web3;
    this.address = _dsa.address;
    this.compound = _dsa.compound;
    this.dsa = _dsa;
  }

  async getLiquidity() {
    return new Promise(async (resolve, reject) => {
      await this.compound
        .getPosition(this.address.core.instapool, "token")
        .then((_position) => {
          var _maxBorrowLimitInEth = _position.maxBorrowLimitInEth * 0.995;
          var _liquidityAvailable = {
            eth: _maxBorrowLimitInEth,
            dai: _maxBorrowLimitInEth / _position.dai.priceInEth,
            usdc: _maxBorrowLimitInEth / _position.usdc.priceInEth,
            usdt: _maxBorrowLimitInEth / _position.usdt.priceInEth,
            bat: _maxBorrowLimitInEth / _position.bat.priceInEth,
            zrx: _maxBorrowLimitInEth / _position.zrx.priceInEth,
            wbtc: _maxBorrowLimitInEth / _position.wbtc.priceInEth,
            rep: _maxBorrowLimitInEth / _position.rep.priceInEth,
          };
          resolve(_liquidityAvailable);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
};

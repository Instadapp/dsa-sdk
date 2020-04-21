module.exports = class Compound {
  /**
   * @param {Object} _dsa the dsa instance to access data stores
   */
  constructor(_dsa) {
    this.web3 = _dsa.web3;
    this.address = this.address;
    this.compound = _dsa.compound;
    this.dsa = _dsa;
  }

  async getLiquidity() {
    return new Promise(async (resolve, reject) => {
      await this.compound
        .getPosition(this.address.instapool, "token")
        .then((_position) => {
          var _maxBorrowLimitInEth = _position.maxBorrowLimitInEth * 0.745;
          var _liquidityAvailable = {
            eth: _maxBorrowLimitInEth,
            dai: _maxBorrowLimitInEth / _position.dai.priceInEth,
            usdc: _maxBorrowLimitInEth / _position.usdc.priceInEth,
          };
          resolve(_liquidityAvailable);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
};

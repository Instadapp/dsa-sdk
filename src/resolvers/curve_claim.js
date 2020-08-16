module.exports = class Curve {
  /**
   * @param {Object} _dsa the dsa instance to access data stores
   */
  constructor(_dsa) {
    this.ABI = _dsa.ABI;
    this.address = _dsa.address;
    this.tokens = _dsa.tokens;
    this.web3 = _dsa.web3;
    this.instance = _dsa.instance;
    this.math = _dsa.math;
    this.dsa = _dsa;
  }

  /**
   * get properly formatted Curve position details
   * @param {string} address the owner address
   */
  async getPosition(address) {
    var _address = !address ? this.instance.address : address;

    var _obj = {
      protocol: "curve_claim",
      method: "getPosition",
      args: [_address],
    };

    return new Promise((resolve, reject) => {
      return this.dsa
        .read(_obj)
        .then((res) => {
          let _position = {};
          _position.vestedBalance = this.tokens.toDecimal(res[0], "CRV");
          _position.unclaimedBalance = this.tokens.toDecimal(res[1], "CRV");
          _position.claimedBalance = res[2] / 10 ** 18;
          _position.lockedBalance = this.tokens.toDecimal(res[3], "CRV");
          _position.crvBalance = this.tokens.toDecimal(res[4], "CRV");
          resolve(_position);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
};

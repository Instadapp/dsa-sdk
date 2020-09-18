module.exports = class DydxFlashLoan {
  /**
   * @param {Object} _dsa the dsa instance to access data stores
   */
  constructor(_dsa) {
    this.web3 = _dsa.web3;
    this.address = _dsa.address;
    this.dsa = _dsa;
    this.internal = _dsa.internal;
    this.tokens = _dsa.tokens;
  }

  async getLiquidity() {
    var dydxSoloAddr = "0x1E0447b19BB6EcFdAe1e4AE1694b0C3659614e4e";
    var wethAddr = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    var daiAddr = this.tokens.info.dai.address;
    var usdcAddr = this.tokens.info.usdc.address;
    var _obj = {
      protocol: "erc20",
      method: "getBalances",
      args: [dydxSoloAddr, [wethAddr, daiAddr, usdcAddr]],
    };

    return new Promise((resolve, reject) => {
      return this.dsa
        .read(_obj)
        .then((res) => {
          var _max = 0.99;
          var _liquidityAvailable = {
            eth: this.tokens.toDecimal(res[0], "eth") * _max,
            dai: this.tokens.toDecimal(res[1], "dai") * _max,
            usdc: this.tokens.toDecimal(res[2], "usdc") * _max,
          };
          resolve(_liquidityAvailable);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  encodeFlashCastData(token, amount, spells) {
    if (!token) throw new Error(`'token' not defined`);
    if (!amount) throw new Error(`'amount' not defined`);

    let encodeSpellsData = this.internal.encodeSpells(spells);
    let argTypes = ["address", "uint256", "address[]", "bytes[]"];
    return this.web3.eth.abi.encodeParameters(argTypes, [
      token,
      amount,
      encodeSpellsData[0],
      encodeSpellsData[1],
    ]);
  }
};

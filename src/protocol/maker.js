var colInfo = {
  "ETH-A": {
    token: "ETH",
    name: "ETH-A",
    ratio: 2 / 3,
    joinAddr: "0x2F0b23f53734252Bda2277357e97e1517d6B042A",
    addr: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    stabiltyRate: 0,
    price: 0,
    typeBytes: "0x4554482d41000000000000000000000000000000000000000000000000000000"
  },
  "BAT-A": {
    token: "BAT",
    name: "BAT-A",
    ratio: 2 / 3,
    joinAddr: "0x3D0B1912B66114d4096F48A8CEe3A56C231772cA",
    addr: "0x0d8775f648430679a709e98d2b0cb6250d2887ef",
    stabiltyRate: 0,
    price: 0,
    typeBytes: "0x4241542d41000000000000000000000000000000000000000000000000000000"
  },
  "USDC-A": {
    token: "USDC",
    name: "USDC-A",
    ratio: 4 / 5,
    joinAddr: "0xa191e578a6736167326d05c119ce0c90849e84b7",
    addr: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    stabiltyRate: 0,
    price: 0,
    typeBytes: "0x555344432d410000000000000000000000000000000000000000000000000000"
  },
};

module.exports = class Compound {
  /**
   * @param {Object} _dsa the dsa instance to access data stores
   */
  constructor(_dsa) {
    this.ABI = _dsa.ABI;
    this.address = _dsa.address;
    this.tokens = _dsa.tokens;
    this.web3 = _dsa.web3;
    this.helpers = _dsa.helpers;
    this.dsa = _dsa;
    this.colInfo = colInfo;
  }

  calStabilityRate(ilkRate) {
    ilkRate = Number(ilkRate) / 10 ** 27;
    return ilkRate ** 31545000 - 1;
  }

  /**
   * get properly formatted compound position details
   * @param {string} address the owner address
   * @param {string} cTokens the cToken address
   */
  async getVaults(_address) {
    var _c = new this.web3.eth.Contract(
      this.ABI.read["maker"],
      this.address.read["maker"]
    );
    var _obj = {
      protocol: "maker",
      method: "getVaults",
      args: [_address],
    };
    return new Promise(async (resolve, reject) => {
      await this.dsa
        .read(_obj)
        .then((res) => {
          var _userVaults = res;
          var userVaults = {};
          for (var i = 0; i < _userVaults.length; i++) {
            var _id = _userVaults[i][0];
            userVaults[_id] = {};
            userVaults[_id].owner = _userVaults[i][1];
            userVaults[_id].colName = _userVaults[i][2];
            userVaults[_id].token = this.colInfo[_userVaults[i][2]].token;
            userVaults[_id].col = this.helpers.divWithDec(
              _userVaults[i][3],
              18
            );
            userVaults[_id].debt = this.helpers.divWithDec(
              _userVaults[i][5],
              18
            );
            userVaults[_id].liquidatedCol = this.helpers.divWithDec(
              _userVaults[i][6],
              18
            );
            userVaults[_id].rate =
              this.calStabilityRate(_userVaults[i][7]) * 100;
            userVaults[_id].price = this.helpers.divWithDec(
              _userVaults[i][8],
              27
            );
            userVaults[_id].ratio =
              1 / this.helpers.divWithDec(_userVaults[i][9], 27);
            userVaults[_id].urn = _userVaults[i][10];
          }
          resolve(userVaults);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
};

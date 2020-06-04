var colInfo = {
  "ETH-A": {
    token: "ETH",
    ratio: 2 / 3,
    joinAddr: "0x2F0b23f53734252Bda2277357e97e1517d6B042A",
    addr: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    stabiltyRate: 0,
    price: 0,
    typeBytes:
      "0x4554482d41000000000000000000000000000000000000000000000000000000",
  },
  "BAT-A": {
    token: "BAT",
    ratio: 2 / 3,
    joinAddr: "0x3D0B1912B66114d4096F48A8CEe3A56C231772cA",
    addr: "0x0d8775f648430679a709e98d2b0cb6250d2887ef",
    stabiltyRate: 0,
    price: 0,
    typeBytes:
      "0x4241542d41000000000000000000000000000000000000000000000000000000",
  },
  "USDC-A": {
    token: "USDC",
    ratio: 4 / 5,
    joinAddr: "0xa191e578a6736167326d05c119ce0c90849e84b7",
    addr: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    stabiltyRate: 0,
    price: 0,
    typeBytes:
      "0x555344432d410000000000000000000000000000000000000000000000000000",
  },
  "WBTC-A": {
    token: "WBTC",
    ratio: 2 / 3,
    joinAddr: "0xBF72Da2Bd84c5170618Fbe5914B0ECA9638d5eb5",
    addr: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    stabiltyRate: 0,
    price: 0,
    typeBytes:
      "0x574254432d410000000000000000000000000000000000000000000000000000",
  },
  "USDC-B": {
    token: "USDC",
    ratio: 2 / 3,
    joinAddr: "0x2600004fd1585f7270756DDc88aD9cfA10dD0428",
    addr: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    stabiltyRate: 0,
    price: 0,
    typeBytes:
      "0x555344432d420000000000000000000000000000000000000000000000000000",
  },
  "TUSD-A": {
    token: "TUSD",
    ratio: 2 / 3,
    joinAddr: "0x4454aF7C8bb9463203b66C816220D41ED7837f44",
    addr: "0x0000000000085d4780B73119b644AE5ecd22b376",
    stabiltyRate: 0,
    price: 0,
    typeBytes:
      "0x545553442d410000000000000000000000000000000000000000000000000000",
  },
};

module.exports = class Maker {
  /**
   * @param {Object} _dsa the dsa instance to access data stores
   */
  constructor(_dsa) {
    this.ABI = _dsa.ABI;
    this.address = _dsa.address;
    this.tokens = _dsa.tokens;
    this.web3 = _dsa.web3;
    this.math = _dsa.math;
    this.dsa = _dsa;
    this.colInfo = colInfo;
  }

  calRate(ilkRate) {
    ilkRate = Number(ilkRate) / 10 ** 27;
    return ilkRate ** 31545000 - 1;
  }

  /**
   * get properly formatted compound position details
   * @param {string} address the owner address
   * @param {string} cTokens the cToken address
   */
  async getVaults(address) {
    var _address;
    !address ? (_address = this.instance.address) : (_address = address);
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
            var _col = this.math.divWithDec(_userVaults[i][3], 18);
            userVaults[_id].col = _col;
            var _debt = this.math.divWithDec(_userVaults[i][5], 18);
            userVaults[_id].debt = _debt;
            userVaults[_id].liquidatedCol = this.math.divWithDec(
              _userVaults[i][6],
              18
            );
            userVaults[_id].rate = this.calRate(_userVaults[i][7]) * 100;
            var _price = this.math.divWithDec(_userVaults[i][8], 27);
            userVaults[_id].price = _price;
            userVaults[_id].status = _debt / (_col * _price);
            userVaults[_id].liquidation =
              1 / this.math.divWithDec(_userVaults[i][9], 27);
            userVaults[_id].urn = _userVaults[i][10];
          }
          resolve(userVaults);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async getCollateralInfo() {
    var _obj = {
      protocol: "maker",
      method: "getColInfo",
      args: [Object.keys(this.colInfo)],
    };

    return new Promise(async (resolve, reject) => {
      await this.dsa
        .read(_obj)
        .then((res) => {
          var _colInfo = {};
          Object.keys(this.colInfo).forEach((_col, i) => {
            _colInfo[_col] = {};
            _colInfo[_col].token = this.colInfo[_col].token;
            _colInfo[_col].rate = this.calRate(res[i][0]) * 100; // in percent
            _colInfo[_col].price = res[i][1] / 1e27;
            _colInfo[_col].ratio = 1 / (res[i][2] / 1e27);
          });
          resolve(_colInfo);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async getDaiPosition(address) {
    var _obj = {
      protocol: "maker",
      method: "getDaiPosition",
      args: [address],
    };

    return new Promise(async (resolve, reject) => {
      await this.dsa
        .read(_obj)
        .then((res) => {
          var _dsrInfo = {
            balance: res[0] / 1e18,
            rate: this.calRate(res[1]),
          };
          resolve(_dsrInfo);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  async getDaiRate() {
    var _obj = {
      protocol: "maker",
      method: "getDsrRate",
      args: [],
    };

    return new Promise(async (resolve, reject) => {
      await this.dsa
        .read(_obj)
        .then((res) => {
          resolve({ rate: this.calRate(res) });
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
};

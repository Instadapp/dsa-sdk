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
    var _pools = ["susd", "y", "sbtc"];
    var _poolReward = {
      susd: "snx",
      sbtc: "snx_ren",
    };
    var _obj = {
      protocol: "curve_gauge",
      method: "getPositions",
      args: [_pools.map((a) => `gauge-${a}`), _address],
    };

    return new Promise((resolve, reject) => {
      return this.dsa
        .read(_obj)
        .then((res) => {
          let _position = {};
          res.forEach((_res, i) => {
            let _pool = _pools[i];
            _position[_pool] = {
              stakedBalance: this.tokens.toDecimal(_res[0], `curve${_pool}`),
              crvEarned: this.tokens.toDecimal(_res[1], "crv"),
              crvClaimed: this.tokens.toDecimal(_res[2], "crv"),
              crvBalance: this.tokens.toDecimal(_res[5], "crv"),
            };
            _position[_pool].crvUnclaimed =
              _position[_pool].crvEarned - _position[_pool].crvClaimed;

            if (_res[7]) {
              _position[_pool].rewardClaimed = this.tokens.toDecimal(
                _res[4],
                _poolReward[_pool]
              );
              _position[_pool].rewardEarned = this.tokens.toDecimal(
                _res[3],
                _poolReward[_pool]
              );
              _position[_pool].rewardBalance = this.tokens.toDecimal(
                _res[6],
                _poolReward[_pool]
              );
              _position[_pool].rewardToken = _poolReward[_pool];
              _position[_pool].rewardsUnclaimed =
                _position[_pool].rewardEarned - _position[_pool].rewardClaimed;
            }
          });
          resolve(_position);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }
};

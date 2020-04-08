const address = require("./constant/address.js");
const abi = require("./constant/abi.js");

module.exports = class Internal {
  constructor() {
    this.ABI = abi;
    this.address = address;
  }

  /**
   * returns the input interface required for cast()
   */
  getTarget(_co) {
    const _t = this.address.connectors[_co];
    if (_t) return _t;
    else return console.error(`${_co} is invalid connector.`);
  }

  /**
   * returns the ABI interface for any DSA contract
   */
  getInterface(_type, _co, _m) {
    const _abi = ABI[_type][_co];
    for (let i = 0; i < _abi.length; i++) {
      if (_abi[i].name == _m) {
        return _abi[i];
      }
    }
    return console.error(`${_m} is invalid method.`);
  }

  /**
   * returns the input interface for any connector
   */
  getConnectorInterface(_co, _m) {
    return this.getInterface("connectors", _co, _m);
  }

  /**
   * returns encoded data of any calls
   */
  encodeMethod(_d) {
    const _co = _d.connector;
    const _m = _d.method;
    const _a = _d.args; // []
    const _i = this.getInterface("connectors", _co, _m);
    return web3.eth.abi.encodeFunctionCall(_i, _a);
  }

  /**
   * returns encoded data of spells (used via cast() mostly)
   */
  encodeSpells(_d) {
    let _s;
    if (Array.isArray(_d.spells)) {
      _s = _d.spells; // required
    } else {
      _s = _d.spells.spells; // required
    }
    let _ta = [];
    let _eda = [];
    for (let i = 0; i < _s.length; i++) {
      _ta.push(this.getTarget(_s[i].connector));
      _eda.push(this.encodeMethod(_s[i]));
    }
    return [_ta, _eda];
  }

  /**
   * returns the input interface required for cast()
   */
  async getAddress() {
    let address = await web3.eth.getAccounts();
    if (address.length == 0)
      return console.error("No ethereum address detected!!!");
    return address[0];
  }

  async estimateGas(_d) {
    // _d parameters
    // {
    //   from: "0x...",
    //   to: "0x...",
    //   abi: [],
    //   args: [],
    //   value: 0,
    // }
    var encodeHash = web3.eth.abi.encodeFunctionCall(_d.abi, _d.args);
    return new Promise(async function (resolve, reject) {
      await web3.eth
        .estimateGas({
          from: _d.from,
          to: _d.to,
          data: encodeHash,
          value: _d.value,
        })
        .then((gas) => {
          console.log(gas);
          resolve(gas);
        })
        .catch((err) => {
          reject({
            error: err,
            data: {
              abi: _d.abi,
              args: _d.args,
              from: _d.from,
              to: _d.to,
              data: encodeHash,
              value: _d.value,
            },
          });
          console.log(err);
        });
    });
  }
};

const Helpers = require("./helpers.js");
const { address, ABI } = require("./constant.js");

module.exports = class DSA {
  constructor() {
    this.user = {};
    this.address = address;
    this.ABI = ABI;
    this.helpers = new Helpers();
    
  }

  /**
   * returns the current DSA ID
   */
  getUser() {
    return this.user;
  }

  /**
   * sets the current DSA ID
   */
  setUser(_o) {
    this.user.id = _o.id;
    this.user.address = _o.address;
  }

  /**
   * build new DSA
   */
  async build(_d) {
    var _a = web3.currentProvider.selectedAddress;
    if (!_d) _d = {};
    if (!_d.owner) _d.owner = _a;
    if (!_d.version) _d.version = 1;
    if (!_d.origin) _d.origin = address.genesis;
    var _c = await new web3.eth.Contract(ABI.core.index, address.core.index);
    return _c.methods
      .build(_d.owner, _d.version, _d.origin)
      .send({ from: _a })
      .on("error", (err) => {
        return err;
      })
      .on("transactionHash", (txHash) => {
        return txHash;
      });
  }

  /**
   * global number of DSAs
   */
  async count() {
    var _c = new web3.eth.Contract(ABI.core.list, address.core.list);
    return await _c.methods
      .accounts()
      .call()
      .then((count) => {
        return count;
      })
      .catch((err) => {
        return err;
      });
  }

  /**
   * returns accounts in a simple array of objects
   */
  async getAccounts(_owner) {
    var _c = new web3.eth.Contract(ABI.resolvers.core, address.resolvers.core);
    return await _c.methods
      .getOwnerDetails(_owner)
      .call({ from: address.genesis })
      .then((raw_data) => {
        numberOfAccounts = raw_data.IDs.length;
        accounts = new Array(numberOfAccounts);
        for (var i = 0; i < numberOfAccounts; i++) {
          accounts[i] = [];
        }
        raw_data.IDs.forEach((v, i) => {
          accounts[i].id = v;
        });
        raw_data.accounts.forEach((v, i) => {
          accounts[i].account_id = v;
        });
        raw_data.versions.forEach((v, i) => {
          accounts[i].version = v;
        });
        return accounts;
      })
      .catch((err) => {
        return err;
      });
  }

  /**
   * returns authentications by accountID
   */
  async getAuthentications(_id) {
    var _c = new web3.eth.Contract(ABI.resolvers.core, address.resolvers.core);
    await _c.methods
      .getIDOwners(_id)
      .call({ from: address.genesis })
      .then((data) => {
        return data;
      })
      .catch((err) => {
        return err;
      });
  }

  /**
   * returns the input interface required for cast()
   */
  getInterface(_o) {
    const _co = _o.connector;
    const _m = _o.method;
    const _abi = ABI.connectors[_co];
    for (let i = 0; i < _abi.length; i++) {
      if (_abi[i].name == _m) {
        return _abi[i];
      }
    }
    return console.error(`${_m} is invalid method.`);
  }

  /**
   * returns the input interface required for cast()
   */
  getTarget(_o) {
    const _co = _o.connector;
    const _t = this.address.connectors[_co];
    if (_t) return _t;
    else return console.error(`${_co} is invalid connector.`);
  }

  /**
   * returns encoded data of delegate call
   * mostly used internally with cast
   */
  async encodeMethod(_d) {
    const _co = _d.connector;
    const _m = _d.method;
    const _a = _d.args; // []
    const _i = getInterface({ connector: _co, method: _m });
    return web3.eth.abi.encodeFunctionCall(_i, _a);
  }

  /**
   * init money lego txns
   */
  async cast(_d) {
    if (!_d.origin) _d.origin = address.genesis;
    const spells = _d.spells;
    let _ta = [];
    let _da = [];
    for (let i = 0; i < spells.length; i++) {
      _ta.push(getTarget(spells[i]));
      _da.push(encodeMethod(spells[i]));
    }
    var _a = web3.currentProvider.selectedAddress;
    var _c = await new web3.eth.Contract(ABI.core.account, this.user.address);
    return _c.methods
      .cast(_ta, _da, _d.origin)
      .send({ from: _a })
      .on("error", (err) => {
        return err;
      })
      .on("transactionHash", (txHash) => {
        return txHash;
      });
  }
};

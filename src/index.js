// add checks - if user

const Helpers = require("./helpers.js");
const { address, ABI } = require("./constant.js");

module.exports = class DSA {
  constructor() {
    this.user = {};
    this.ABI = ABI;
    this.address = address;
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
    if (_o.id) this.user.id = _o.id;
    if (_o.account) this.user.account = _o.account;
    if (_o.verion) this.user.verion = _o.verion;
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
    return await _c.methods
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
    if (!_owner) _owner = web3.currentProvider.selectedAddress;
    var _c = new web3.eth.Contract(ABI.resolvers.core, address.resolvers.core);
    return await _c.methods
      .getOwnerDetails(_owner)
      .call({ from: address.genesis })
      .then((_d) => {
        var _l = _d.IDs.length;
        var accounts = [];
        for (var i = 0; i < _l; i++) {
          accounts.push({
            id: _d.IDs[i],
            account: _d.accounts[i],
            version: _d.versions[i],
          });
        }
        return accounts;
      })
      .catch((err) => {
        return err;
      });
  }

  /**
   * returns authentications by accountID
   */
  async getAuthorities(_id) {
    if (!_id) _id = this.user.id;
    var _c = new web3.eth.Contract(ABI.resolvers.core, address.resolvers.core);
    return await _c.methods
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
  getInterface(_co, _m) {
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
  getTarget(_co) {
    const _t = address.connectors[_co];
    if (_t) return _t;
    else return console.error(`${_co} is invalid connector.`);
  }

  /**
   * returns encoded data of delegate call
   * mostly used internally with cast
   */
  encodeMethod(_d) {
    const _co = _d.connector;
    const _m = _d.method;
    const _a = _d.args; // []
    const _i = this.getInterface(_co, _m);
    return web3.eth.abi.encodeFunctionCall(_i, _a);
  }

  /**
   * init money lego txns
   */
  async cast(_d) {
    if (!_d.origin) _d.origin = address.genesis;
    const _s = _d.spells;
    let _ta = [];
    let _da = [];
    for (let i = 0; i < _s.length; i++) {
      _ta.push(this.getTarget(_s[i].connector));
      _da.push(this.encodeMethod(_s[i]));
    }
    var _a = web3.currentProvider.selectedAddress;
    var _c = await new web3.eth.Contract(ABI.core.account, this.user.account);
    return await _c.methods
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

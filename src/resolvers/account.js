/**
 * account resolver
 */
module.exports = class Account {
  
  /**
   * @param {Object} dsa the dsa instance to access data stores
   */
  constructor(dsa) {
    this.dsa = dsa;
  }

  /**
   * global number of DSAs
   */
  async count() {
    var _c = new this.dsa.web3.eth.Contract(
      this.dsa.ABI.core.list,
      this.dsa.address.core.list
    );
    return new Promise((resolve, reject) => {
      return _c.methods
        .accounts()
        .call({ from: this.dsa.address.genesis })
        .then((count) => {
          resolve(count);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * returns accounts in a simple array of objects for addresses owned by the address
   * @param _authority the ethereum address
   */
  async getAccounts(_authority) {
    if (!_authority) _authority = await this.dsa.internal.getAddress();
    var _c = new this.dsa.web3.eth.Contract(
      this.dsa.ABI.resolvers.core,
      this.dsa.address.resolvers.core
    );
    return new Promise((resolve, reject) => {
      return _c.methods
        .getAuthorityDetails(_authority)
        .call({ from: this.dsa.address.genesis })
        .then((_d) => {
          var _l = _d.IDs.length;
          var accounts = [];
          for (var i = 0; i < _l; i++) {
            accounts.push({
              id: _d.IDs[i],
              address: _d.accounts[i],
              version: _d.versions[i],
            });
          }
          resolve(accounts);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * returns accounts in a simple array of objects
   * @param _id the DSA number
   */
  async getAuthById(_id) {
    var _c = new this.dsa.web3.eth.Contract(
      this.dsa.ABI.resolvers.core,
      this.dsa.address.resolvers.core
    );
    return new Promise((resolve, reject) => {
      return _c.methods
        .getIDAuthorities(_id)
        .call({ from: this.dsa.address.genesis })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

  /**
   * returns accounts in a simple array of objects
   * @param _id the DSA address
   */
  async getAuthByAddress(_addr) {
    var _c = new this.dsa.web3.eth.Contract(
      this.dsa.ABI.resolvers.core,
      this.dsa.address.resolvers.core
    );
    return new Promise((resolve, reject) => {
      return _c.methods
        .getAccountAuthorities(_addr)
        .call({ from: this.dsa.address.genesis })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  }

}
export default class Core {
  /**
   * Build new DSA
   */
  async build(_d) {
    var _a = web3.currentProvider.selectedAddress;
    if (!_d) _d = {};
    if (!_d.owner) _d.owner = _a;
    if (!_d.version) _d.version = 1;
    if (!_d.origin) _d.origin = this.address.genesis;
    var _c = new web3.eth.Contract(this.ABI.INDEX_CORE, this.address.index);
    return _c.methods
      .build(_d.owner, _d.version, _d.origin)
      .send({
        from: _a,
      })
      .on("transactionHash", (txHash) => {
        console.log(`txHash: ${txHash}`);
        return txHash;
      });
  }

  /**
   * Global number of DSAs
   */
  async count() {
    var _c = new web3.eth.Contract(this.ABI.LIST_CORE, this.address.list);
    return _c.methods
      .accounts()
      .call()
      .then((count) => {
        return count;
      });
  }

  /**
   * returns accounts in an simple array of objects
   */
  async getAccounts(_owner) {
    var _c = new web3.eth.Contract(this.ABI.CORE_RESOLVER, this.address.core);
    return _c.methods
      .getOwnerDetails(_owner)
      .call({ from: this.address.genesis })
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
      });
  }

  /**
   * returns authentications by accountID
   */
  async getAuthentications(_id) {
    var _c = new web3.eth.Contract(
      this.ABI.CORE_RESOLVER,
      this.address.instaread
    );
    return _c.methods.getIDOwners(_id).call({ from: this.address.genesis });
  }
}

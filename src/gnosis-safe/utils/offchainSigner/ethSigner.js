module.exports = class ETHSigner {
  // 1. we try to sign via EIP-712 if user's wallet supports it
  // 2. If not, try to use eth_sign (Safe version has to be >1.1.1)
  // If eth_sign, doesn't work continue with the regular flow (on-chain signatures, more in createTransaction.ts)
  constructor(_dsa) {
    this.web3 = _dsa.web3;
    this.ETH_SIGN_NOT_SUPPORTED_ERROR_MSG = "ETH_SIGN_NOT_SUPPORTED";
  }

  async ethSigner({
    baseGas,
    data,
    gasPrice,
    gasToken,
    nonce,
    operation,
    refundReceiver,
    safeInstance,
    safeTxGas,
    sender,
    to,
    valueInWei,
  }) {
    const txHash = await safeInstance.methods
      .getTransactionHash(
        to,
        valueInWei,
        data,
        operation,
        safeTxGas,
        baseGas,
        gasPrice,
        gasToken,
        refundReceiver,
        nonce,
        {
          from: sender,
        }
      )
      .call();

    const web3 = this.web3;

    return new Promise(function (resolve, reject) {
      web3.currentProvider.sendAsync(
        {
          jsonrpc: "2.0",
          method: "eth_sign",
          params: [sender, txHash],
          id: new Date().getTime(),
        },
        async function (err, signature) {
          if (err) {
            return reject(err);
          }

          if (signature.result == null) {
            reject(new Error(this.ETH_SIGN_NOT_SUPPORTED_ERROR_MSG));
            return;
          }

          const sig = signature.result.replace("0x", "");
          let sigV = parseInt(sig.slice(-2), 16);

          // Metamask with ledger returns v = 01, this is not valid for ethereum
          // For ethereum valid V is 27 or 28
          // In case V = 0 or 01 we add it to 27 and then add 4
          // Adding 4 is required to make signature valid for safe contracts:
          // https://gnosis-safe.readthedocs.io/en/latest/contracts/signatures.html#eth-sign-signature
          switch (sigV) {
            case 0:
            case 1:
              sigV += 31;
              break;
            case 27:
            case 28:
              sigV += 4;
              break;
            default:
              throw new Error("Invalid signature");
          }

          resolve(sig.slice(0, -2) + sigV.toString(16));
        }
      );
    });
  }
};

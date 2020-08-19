const ETHSigner = require("./ethSigner");
const EIP712Signer = require("./EIP712Signer");

// 1. we try to sign via EIP-712 if user's wallet supports it
// 2. If not, try to use eth_sign (Safe version has to be >1.1.1)
// If eth_sign, doesn't work continue with the regular flow (on-chain signatures, more in createTransaction.ts)
module.exports = class OffChainSign {
  constructor(_dsa) {
    this.web3 = _dsa.web3;
    this.SAFE_VERSION_FOR_OFFCHAIN_SIGNATURES = ">=1.1.1";
    this.ethSigner = new ETHSigner(this);
    this.eip712Signer = new EIP712Signer(this);
    this.SIGNERS = {
      EIP712_V3: this.eip712Signer.getEIP712Signer("v3"),
      EIP712_V4: this.eip712Signer.getEIP712Signer("v4"),
      EIP712: this.eip712Signer.getEIP712Signer(),
      ETH_SIGN: this.ethSigner.ethSigner,
    };
  }

  // hardware wallets support eth_sign only
  getSignersByWallet(isHW) {
    return isHW
      ? [this.SIGNERS.ETH_SIGN]
      : [
          this.SIGNERS.EIP712_V3,
          this.SIGNERS.EIP712_V4,
          this.SIGNERS.EIP712,
          this.SIGNERS.ETH_SIGN,
        ];
  }

  async tryOffchainSigning(txArgs, isHW) {
    let signature;

    const signerByWallet = this.getSignersByWallet(isHW);
    for (const signingFunc of signerByWallet) {
      try {
        signature = await signingFunc(txArgs);

        break;
      } catch (err) {
        console.error(err);
        // Metamask sign request error code
        if (err.code === 4001) {
          throw new Error("User denied sign request");
        }
      }
    }

    return signature;
  }
};

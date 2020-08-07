const semverSatisfies = require('semver/functions/satisfies')
const TransactionsHelpers = require("./transactionHelpers.js");
const GasEstimate = require("./estimateGas.js");
const OffchainSigner = require("./offchainSigner/index.js");
const Web3Helper = require("./web3Helper.js");

module.exports = class GnosisSafeCreateTransactions {
    constructor(_dsa) {
        this.internal = _dsa.internal;
        this.ABI = _dsa.ABI;
        this.web3 = _dsa.web3;
        this.address = _dsa.address;
        this.internal = _dsa.internal;
        this.sendTxn = _dsa.sendTxn;
        this.web3Helper = new Web3Helper(this);
        this.apiHelpers = _dsa.apiHelpers;
        this.transactionsHelpers = new TransactionsHelpers(this);
        this.gasEstimate = new GasEstimate(this);
        this.offchainSigner = new OffchainSigner(this);
    }

    async createTransaction({
        safeAddress,
        to,
        from,
        valueInWei,
        txData = "0x",
        txNonce,
        operation = 0,
        origin = null,
    }) {
        return new Promise(async (resolve, reject) => {
            const _owners = await this.apiHelpers.getSafeOwners(safeAddress);
            if(_owners.indexOf(this.web3.utils.toChecksumAddress(from)) == "-1") 
                throw new Error("'from' address is not owner of safe address")
            const {
                hardwareWallet,
                smartContractWallet,
            } = await this.web3Helper.getProviderInfo(from);
            const safeInstance = await this.transactionsHelpers.getGnosisSafeInstanceAt(safeAddress);
            const lastTx = await this.transactionsHelpers.getLastTx(safeAddress);
            const nonce = Number(await this.transactionsHelpers.getNewTxNonce(txNonce, lastTx, safeInstance));
            const isExecution = await this.transactionsHelpers.shouldExecuteTransaction(
                safeInstance,
                nonce,
                lastTx
            );
            const safeVersion = await safeInstance.methods.VERSION().call();
            const safeTxGas = await this.gasEstimate.estimateSafeTxGas(
                safeInstance,
                safeAddress,
                txData,
                to,
                valueInWei,
                operation
            );

            // https://docs.gnosis.io/safe/docs/docs5/#pre-validated-signatures
            const sigs = `0x000000000000000000000000${from.replace(
                "0x",
                ""
            )}000000000000000000000000000000000000000000000000000000000000000001`;

            const txArgs = {
                safeInstance,
                to,
                valueInWei,
                data: txData,
                operation,
                nonce,
                safeTxGas,
                baseGas: 0,
                gasPrice: 0,
                gasToken: this.address.genesis,
                refundReceiver: this.address.genesis,
                sender: from,
                sigs,
            };

            try {
                // Here we're checking that safe contract version is greater or equal 1.1.1, but
                // theoretically EIP712 should also work for 1.0.0 contracts
                const canTryOffchainSigning =
                !isExecution &&
                !smartContractWallet &&
                semverSatisfies(safeVersion, this.offchainSigner.SAFE_VERSION_FOR_OFFCHAIN_SIGNATURES);
                if (canTryOffchainSigning) {
                    const signature = await this.offchainSigner.tryOffchainSigning(
                        { ...txArgs, safeAddress },
                        hardwareWallet
                    );
                    if (signature) {
                        await this.apiHelpers.saveTxToHistory({ ...txArgs, signature, origin });
                        resolve({
                            signature: signature
                        })
                        return;
                    }
                }

                const tx = isExecution
                ? await this.transactionsHelpers.getExecutionTransaction(txArgs)
                : await this.transactionsHelpers.getApprovalTransaction(txArgs);
                const sendParams = { from, value: 0 };
                await tx.send(sendParams)
                .once("transactionHash", async (hash) => {
                    try {
                        await Promise.all([this.apiHelpers.saveTxToHistory({ ...txArgs, hash, origin })]);
                        resolve({
                            txHash: hash
                        });
                    } catch (e) {
                    }
                })
                .on("error", (error) => {
                    console.error("Tx error: ", error);
                })
            } catch (err) {
                console.error(`Error creating the TX: `, err);

                const executeDataUsedSignatures = safeInstance.methods
                    .execTransaction(
                        to,
                        valueInWei,
                        txData,
                        operation,
                        0,
                        0,
                        0,
                        address.genesis,
                        address.genesis,
                        sigs
                    ).encodeABI();
                const errMsg = await getErrorMessage(
                    safeInstance.options.address,
                    0,
                    executeDataUsedSignatures,
                    from
                );
                let msg = `Error creating the TX - an attempt to get the error message: ${errMsg}`;
                reject(msg)
            }
        })
    }

    
}
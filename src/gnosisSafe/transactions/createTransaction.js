import { getExecutionTransaction, getApprovalTransaction } from "./send";
import { getGnosisSafeInstanceAt } from "../contracts/safeContracts";
import { getProviderInfo } from "../getWeb3";
import { getLastTx, getNewTxNonce, shouldExecuteTransaction } from "./utils";
import semverSatisfies from 'semver/functions/satisfies'
import {tryOffchainSigning, SAFE_VERSION_FOR_OFFCHAIN_SIGNATURES} from './offchainSigner'
import {saveTxToHistory} from './txHistory'
import {generateSafeTxHash, getErrorMessage} from './transactionHelpers'
import { estimateSafeTxGas } from './gasNew'
import address from "../../constant/addresses"

export const createTransaction = async ({
  safeAddress,
  to,
  valueInWei,
  txData = "0x",
  txNonce,
  operation = 0,
  origin = null,
}) => {
  const {
    account: from,
    hardwareWallet,
    smartContractWallet,
  } = await getProviderInfo();
  const safeInstance = await getGnosisSafeInstanceAt(safeAddress);
  const lastTx = await getLastTx(safeAddress);
  const nonce = Number(await getNewTxNonce(txNonce, lastTx, safeInstance));
  const isExecution = await shouldExecuteTransaction(
    safeInstance,
    nonce,
    lastTx
  );
  const safeVersion = await safeInstance.methods.VERSION().call();
  const safeTxGas = await estimateSafeTxGas(safeInstance, safeAddress, txData, to, valueInWei, operation)

  // https://docs.gnosis.io/safe/docs/docs5/#pre-validated-signatures
  const sigs = `0x000000000000000000000000${from.replace(
    "0x",
    ""
  )}000000000000000000000000000000000000000000000000000000000000000001`;

  let pendingExecutionKey;
  let txHash;
  let tx;
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
    gasToken: address.genesis,
    refundReceiver: address.genesis,
    sender: from,
    sigs,
  };

  try {
    // Here we're checking that safe contract version is greater or equal 1.1.1, but
    // theoretically EIP712 should also work for 1.0.0 contracts
    const canTryOffchainSigning =
      !isExecution && !smartContractWallet && semverSatisfies(safeVersion, SAFE_VERSION_FOR_OFFCHAIN_SIGNATURES)
    if (canTryOffchainSigning) {
      const signature = await tryOffchainSigning({ ...txArgs, safeAddress }, hardwareWallet)

      if (signature) {
        await saveTxToHistory({ ...txArgs, signature, origin })

        // dispatch(fetchTransactions(safeAddress))
        return
      }
    }

    const tx = isExecution ? await getExecutionTransaction(txArgs) : await getApprovalTransaction(txArgs)
    const sendParams = { from, value: 0 }

    // if not set owner management tests will fail on ganache
    if (process.env.NODE_ENV === 'test') {
      sendParams.gas = '7000000'
    }

    await tx
      .send(sendParams)
      .once('transactionHash', async (hash) => {
        try {
          txHash = hash

          await Promise.all([
            saveTxToHistory({ ...txArgs, txHash, origin }),
          ])
          // dispatch(fetchTransactions(safeAddress))
        } catch (e) {
          // removeTxFromStore(mockedTx, safeAddress, dispatch, state)
        }
      })
      .on('error', (error) => {
        // removeTxFromStore(mockedTx, safeAddress, dispatch, state)
        console.error('Tx error: ', error)
      })
      .then(async (receipt) => {

        // dispatch(fetchTransactions(safeAddress))

        return receipt.transactionHash
      })
  } catch (err) {

    console.error(`Error creating the TX: `, err)

    const executeDataUsedSignatures = safeInstance.methods
      .execTransaction(to, valueInWei, txData, operation, 0, 0, 0, address.genesis, address.genesis, sigs)
      .encodeABI()
    const errMsg = await getErrorMessage(safeInstance.options.address, 0, executeDataUsedSignatures, from)
    console.error(`Error creating the TX - an attempt to get the error message: ${errMsg}`)
  }

  return txHash
};

import axios from "axios";

import { buildTxServiceUrl } from "./txHistory";

export const getLastTx = async (safeAddress) => {
  try {
    const url = await buildTxServiceUrl(safeAddress);
    console.log("url: ", url)
    const response = await axios.get(url, { params: { limit: 1 } });

    return response.data.results[0] || null;
  } catch (e) {
    console.error("failed to retrieve last Tx from server", e);
    return null;
  }
};

export const getNewTxNonce = async (txNonce, lastTx, safeInstance) => {
  if (!Number.isInteger(Number.parseInt(txNonce, 10))) {
    return lastTx === null
      ? // use current's safe nonce as fallback
        (await safeInstance.methods.nonce().call()).toString()
      : `${lastTx.nonce + 1}`;
  }
  return txNonce;
};

export const shouldExecuteTransaction = async (safeInstance, nonce, lastTx) => {
  const threshold = await safeInstance.methods.getThreshold().call();

  // Tx will automatically be executed if and only if the threshold is 1
  if (Number(threshold) === 1) {
    const isFirstTransaction = Number.parseInt(nonce) === 0;
    // if the previous tx is not executed, it's delayed using the approval mechanisms,
    // once the previous tx is executed, the current tx will be available to be executed
    // by the user using the exec button.
    const canExecuteCurrentTransaction = lastTx && lastTx.isExecuted;

    return isFirstTransaction || canExecuteCurrentTransaction;
  }

  return false;
};

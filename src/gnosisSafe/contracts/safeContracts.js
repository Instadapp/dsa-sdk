import GnosisSafeSol from "@gnosis.pm/safe-contracts/build/contracts/GnosisSafe.json";
import { getWeb3 } from "../getWeb3";

export const getGnosisSafeInstanceAt = async (safeAddress) => {
  const web3 = getWeb3();
  const gnosisSafe = await new web3.eth.Contract(
    GnosisSafeSol.abi,
    safeAddress
  );

  return gnosisSafe;
};

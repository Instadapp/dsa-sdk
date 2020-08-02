export const SENTINEL_ADDRESS = "0x0000000000000000000000000000000000000001";
export const MULTI_SEND_ADDRESS = "0x8d29be29923b68abfdd21e541b9374737b49cdad";
export const SAFE_MASTER_COPY_ADDRESS =
  "0x34CfAC646f301356fAa8B21e94227e3583Fe3F5F";
export const DEFAULT_FALLBACK_HANDLER_ADDRESS =
  "0xd5D82B6aDDc9027B22dCA772Aa68D5d74cdBdF44";
export const SAFE_MASTER_COPY_ADDRESS_V10 =
  "0xb6029EA3B2c51D09a50B53CA8012FeEB05bDa35A";
import GnosisSafeSol from "@gnosis.pm/safe-contracts/build/contracts/GnosisSafe.json";
import { getWeb3 } from "../getWeb3";

export const getEncodedMultiSendCallData = (txs, web3) => {
  const multiSendAbi = [
    {
      type: "function",
      name: "multiSend",
      constant: false,
      payable: false,
      stateMutability: "nonpayable",
      inputs: [{ type: "bytes", name: "transactions" }],
      outputs: [],
    },
  ];
  const multiSend = new web3.eth.Contract(multiSendAbi, MULTI_SEND_ADDRESS);
  const encodeMultiSendCallData = multiSend.methods
    .multiSend(
      `0x${txs
        .map((tx) =>
          [
            web3.eth.abi.encodeParameter("uint8", 0).slice(-2),
            web3.eth.abi.encodeParameter("address", tx.to).slice(-40),
            web3.eth.abi.encodeParameter("uint256", tx.value).slice(-64),
            web3.eth.abi
              .encodeParameter("uint256", web3.utils.hexToBytes(tx.data).length)
              .slice(-64),
            tx.data.replace(/^0x/, ""),
          ].join("")
        )
        .join("")}`
    )
    .encodeABI();

  return encodeMultiSendCallData;
};

export const getGnosisSafeInstanceAt = async (safeAddress) => {
  const web3 = getWeb3();
  const gnosisSafe = await new web3.eth.Contract(
    GnosisSafeSol.abi,
    safeAddress
  );

  return gnosisSafe;
};

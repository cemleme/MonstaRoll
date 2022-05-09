import { useEffect, useState, useContext } from "react";
import { useSelector, useDispatch } from "react-redux";
import Web3 from "web3";
import abi from "../constants/abi.json";
import rpcs from "../constants/rpcs";
import contracts from "../constants/contracts";
import ConnectContext from "./ConnectContext";

const useContract = () => {
  const network = useSelector((state) => state.network.value);
  const { address, wallet } = useContext(ConnectContext);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const monstaRollContract = getContract(true);
    setContract(monstaRollContract);
  }, [network, wallet]);

  const getContract = (update = false) => {
    if (contract && !update) return contract;
    const web3 = wallet || new Web3(rpcs[network]);
    const monstaRollContract = new web3.eth.Contract(abi, contracts[network]);
    return monstaRollContract;
  };

  //options= { functionName: string, arguments: array, getPromise: boolean}
  const callContract = async (options) => {
    const contract = getContract();
    if (!contract) return [{ error: "no contract" }, null];
    if (!options.functionName) return [{ error: "no function defined" }, null];

    const args = options.arguments || [];

    const call = contract.methods[options.functionName](...args).call();

    if (options.getPromise) return call;

    try {
      const result = await call;
      return [null, result];
    } catch (err) {
      return [err, null];
    }
  };

  //options = {value, arguments, functionName}
  const sendContract = async (options) => {
    const contract = new wallet.eth.Contract(abi, contracts[network]);
    if (!contract) return [{ error: "no contract" }, null];

    const txOptions = { from: address };

    if (options.value) {
      txOptions.value = wallet.utils.toWei(options.value.toString());
    }

    let err = null;
    const args = options.arguments || [];

    console.log("sendContract txoptions", txOptions);

    // try {
    //   await contract.methods[options.functionName](...args).estimateGas(
    //     txOptions
    //   );
    // } catch (error) {
    //   console.log(error);
    //   return { status: false, message: error.message, txlink: "" };
    // }

    const tx = await contract.methods[options.functionName](...args)
      .send(txOptions)
      .catch((error) => {
        err = error;
        console.log(error.message);
        return { status: false, message: error.message, txlink: "" };
      });

    if (err == null)
      return {
        status: true,
        message: "success",
        txlink: getTxLink(tx.transactionHash),
      };
    else return { status: false, message: err.message, txlink: "" };
  };

  const getTxLink = (hash) => {
    return hash;
    //return scanlinks[network]+'tx/'+hash;
  };

  const bet = async (numBet, amount) => {
    if (!contract) return;
    const result = await sendContract({
      functionName: "play",
      arguments: [numBet],
      value: amount,
    });
  };

  const mint = async (rounds) => {
    if (!contract || rounds.length === 0) return;
    const result = await sendContract({
      functionName: "mintBet",
      arguments: [rounds]
    });
    return result;
  }

  const getUserBets = async () => {
    if (!address) return;
    const [err, result] = await callContract({
      functionName: "getUserBets",
      arguments: [address, 0, 100],
    });
    return result;
  };

  const getBet = async () => {
    if (!address) return;
    const [err, result] = await callContract({
      functionName: "userBets",
      arguments: [address, 0],
    });
    return result;
  };

  const claimBet = async (rounds) => {
    if (!contract || rounds.length === 0) return;
    const result = await sendContract({
        functionName: "claimBet",
        arguments: [rounds]
      });
    return result;
  }

  const getNFTBalance = async(id) => {
    if (!address) return;
    const [err, result] = await callContract({
      functionName: "balanceOf",
      arguments: [address, id],
    });
    return result;
  }

  return { bet, getUserBets, getBet, mint, claimBet, getNFTBalance };
};

export default useContract;

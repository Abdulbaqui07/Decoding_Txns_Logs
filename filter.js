const Web3 = require("web3");
const web3 = new Web3(
  "https://mainnet.infura.io/v3/738d607b3d294eb58ad33862a792d0bc"
);

const contractAddress = "0x1111111254eeb25477b68fb85ed929f73a960582"; // the address of your contract

const funcSig = web3.eth.abi.encodeFunctionSignature(
  "swap(address,(address,address,address,address,uint256,uint256,uint256),bytes,bytes)"
);
console.log("Function signature: " + funcSig);



web3.eth.getBlockNumber().then((blockNumber) => {
  console.log("blockNumber", blockNumber);
  let arr = [];
  for (let i = blockNumber - 200; i <= blockNumber; i++) {
    web3.eth.getBlock(i, true).then((block) => {
      block.transactions.forEach((tx) => {
        if (
          tx.to !== null &&
          tx.to.toLowerCase() === contractAddress &&
          tx.input.slice(0, 10) === "0x12aa3caf"
          // tx.input.slice(0, 10) === "0x0502b1c5" ||
          // tx.input.slice(0, 10) === "0xf78dc253") // swap, unoswap, unoswapTo
        ) {
          const decodedInput = web3.eth.abi.decodeParameters(
            [
              "address",
              "(address,address,address,address,uint256,uint256,uint256)",
              "bytes",
              "bytes",
            ],
            tx.input.slice(10)
          );
          const obj = {
            //executor: decodedInput[0],
            srcToken: decodedInput[1][0],
            destToken: decodedInput[1][1],
            // srcReciever: decodedInput[1][2],
            // destReciever: decodedInput[1][3],
            dscAmount: decodedInput[1][4], //input amount
            minReturn: decodedInput[1][5], //return amount
            hash: tx.hash
          };
          //console.log(obj);
          if (
            obj.srcToken === "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" ||
            obj.destToken === "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
          ) {
            console.log("Yes", obj);
            arr.push(obj);
          }
        }
      });
    });
  }
  console.log("arr", arr);
});
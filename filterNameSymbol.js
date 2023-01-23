const Web3 = require("web3");
const web3 = new Web3(
    "https://mainnet.infura.io/v3/585178b4d49e49c59162eee163ccade8"
);

const { getContractName } = require('./decodingLogs');

const contractAddress = "0x1111111254eeb25477b68fb85ed929f73a960582"; // the address of your contract

//
const USDCcontractaddress = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

const swapFunctionSig = web3.eth.abi.encodeFunctionSignature(
    "swap(address,(address,address,address,address,uint256,uint256,uint256),bytes,bytes)"
);

const unoswapFunctionSig = web3.eth.abi.encodeFunctionSignature("unoswap(address,uint256,uint256,uint256[])")

console.log("Function signature of swap : " + swapFunctionSig);
console.log("Function signature of unoswap : " + unoswapFunctionSig);


let arr = [];
// web3.eth.getBlockNumber().then((blockNumber) => {
//     console.log("blockNumber", blockNumber);
//     for(let i = blockNumber - 200; i <= blockNumber; i++) {
//         web3.eth.getBlock(i, true).then((block) => {
//             block.transactions.forEach((tx) => {
//                 if (
//                     tx.to !== null &&
//                     tx.to.toLowerCase() === contractAddress &&
//                     tx.input.slice(0, 10) === "0x12aa3caf"
//                     // tx.input.slice(0, 10) === "0x0502b1c5" ||
//                     // tx.input.slice(0, 10) === "0xf78dc253") // swap, unoswap, unoswapTo
//                 ) {
//                     const decodedInput = web3.eth.abi.decodeParameters(
//                         [
//                             "address",
//                             "(address,address,address,address,uint256,uint256,uint256)",
//                             "bytes",
//                             "bytes",
//                         ],
//                         tx.input.slice(10)
//                     );
//                     const obj = {
//                         //executor: decodedInput[0],
//                         srcToken: decodedInput[1][0],
//                         destToken: decodedInput[1][1],
//                         // srcReciever: decodedInput[1][2],
//                         // destReciever: decodedInput[1][3],
//                         dscAmount: decodedInput[1][4], //input amount
//                         minReturn: decodedInput[1][5], //return amount
//                         hash: tx.hash
//                     };
//                     //console.log(obj);
//                     if (
//                         obj.srcToken === "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" ||
//                         obj.destToken === "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
//                     ) {
//                         console.log("Yes", obj);
//                         arr.push(obj);
//                     }
//                 }
//             });
//         });
//     }
//     return arr
//   }).then((result) => {

//     console.log("arr", result);
// });



////////

async function getLogs() {
    const blockNumber = await web3.eth.getBlockNumber();
    console.log("blockNumber", blockNumber);

    for (let i = blockNumber - 100; i <= blockNumber; i++) {
        let getBlock = await web3.eth.getBlock(i, true)

        getBlock.transactions.forEach((tx) => {

            if (tx.to !== null && tx.to.toLowerCase() === contractAddress) {
                // console.log("TX ",tx)
                if (tx.input.slice(0, 10) === swapFunctionSig) { // swap
                    swapFn(tx)
                } else if (tx.input.slice(0, 10) === unoswapFunctionSig) { // unoswap
                    unoswapFn(tx)
                }
            }

            //   if (
            //      &&
            //     tx.input.slice(0, 10) === "0x12aa3caf"
            //     // tx.input.slice(0, 10) === "0x0502b1c5" ||
            //     // tx.input.slice(0, 10) === "0xf78dc253") // swap, unoswap, unoswapTo
            // ) {

            // }
        })
    }

    return arr
}

function swapFn(tx) {
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
        'transaction-type': "swap",
        //executor: decodedInput[0],
        'srcToken': decodedInput[1][0],
        'destToken': decodedInput[1][1],
        // srcReciever: decodedInput[1][2],
        // destReciever: decodedInput[1][3],
        'dscAmount': decodedInput[1][4], //input amount
        'minReturn': decodedInput[1][5], //return amount
        'hash': tx.hash
    };

    if (
        obj.srcToken === USDCcontractaddress ||
        obj.destToken === USDCcontractaddress
    ) {
        // console.log("Yes", obj);
        arr.push(obj);
    }
}

function unoswapFn(tx) {
    const decodedInput = web3.eth.abi.decodeParameters(
        [
            "address",
            "uint256",
            "uint256",
            "uint256[]",
        ],
        tx.input.slice(10)
    );
    const obj = {
        'transaction-type': "unoswap",
        "srcToken": decodedInput[0],
        "amount": decodedInput[1],
        "minReturn": decodedInput[2],
        "pools": decodedInput[3],
        "hash": tx.hash
    }

    if (obj.srcToken == USDCcontractaddress) {
        arr.push(obj)
    }
}

// call

async function addContractNameAndSymbol() {
    let result = await getLogs()
    for (let i = 0; i < result.length; i++) {
        if (result[i].srcToken != '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
            console.log("src token : ", result[i].srcToken)
            getContractName(result[i].srcToken).then((data) => {
                result[i].srcTokenName = data.name
                result[i].srcTokenSymbol = data.symbol
            })
            if (result[i].destToken) {
              if(result[i].destToken != '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'){
                console.log("dest token : ", result[i].destToken)
                let desData = await getContractName(result[i].destToken).then((data) => {
                    result[i].destTokenName = data.name
                    result[i].destTokenSymbol = data.symbol
                })
              }
            }
            console.log("changes made \n", result[i])
        }
        // console.log("data : "+i+" "+result[i])
    }

    return result
}



addContractNameAndSymbol().then((data) => {
    console.log(data)
})
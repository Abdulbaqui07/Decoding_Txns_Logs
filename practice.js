const Web3 = require('web3');

const {getlogsOfTxn, main} = require('./decodingLogs.js')

const ContractNameABI = require('./contractNameSymbol.json');

const web3 = new Web3(
    "https://mainnet.infura.io/v3/585178b4d49e49c59162eee163ccade8"
);

const contractAddress = "0x1111111254eeb25477b68fb85ed929f73a960582"; // the address of your contract

const swapFunctionSig = web3.eth.abi.encodeFunctionSignature(
    "swap(address,(address,address,address,address,uint256,uint256,uint256),bytes,bytes)"
);

const unoswapFunctionSig = web3.eth.abi.encodeFunctionSignature("unoswap(address,uint256,uint256,uint256[])")

console.log("Function signature of swap : " + swapFunctionSig);
console.log("Function signature of unoswap : " + unoswapFunctionSig);

// async function getlogsOfTxn(txhash) {
//     let result = await web3.eth.getTransactionReceipt(txhash)

//     return result
// }
let count

async function getTransaction() {
   count = 0
    const blockNumber = await web3.eth.getBlockNumber();
    console.log("blockNumber", blockNumber);

    for (let i = blockNumber - 10; i <= blockNumber; i++) {
        let getBlock = await web3.eth.getBlock(i, true)

        getBlock.transactions.forEach(async (tx) => {

            if (tx.to !== null && tx.to.toLowerCase() === contractAddress) {
                // console.log("TX ",tx)
                if (tx.input.slice(0, 10) === swapFunctionSig || tx.input.slice(0, 10) === unoswapFunctionSig) { // swap
                    count++
                    let resultArr = await logsForwarder(tx)
                    // console.log("result received ", resultArr)
                    const obj = {
                        "data": resultArr.data, "hash": resultArr.hash
                    }
                    arr.push(obj)
                }
            }
        })
    }

    return arr
}

async function transactionType(log) {
    // console.log(log)
    // hash of events 
    let transferEvent = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
    let approvalEvent = "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925";
    let depositEvent = "0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c";
    let withdrawelEvent = "0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65";
    let swapEvent = "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822";
    let syncEvent = "0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1";

    if (log.topics[0].toLowerCase() == transferEvent) {
        let contractname = await getContractNameAndSymbol(log.address)
        return {"tx-type": "transfer", "contract-name": contractname.name}
    } 
    // else if (log.topics[0].toLowerCase() == approvalEvent) {
    //     return "Approve"
    // } else if (log.topics[0].toLowerCase() == depositEvent) {
    //     return "depositEvent";
    // } else if (log.topics[0].toLowerCase() == withdrawelEvent) {
    //     return "Withdraw";
    // } 
    // else if (log.topics[0].toLowerCase() == swapEvent) {
    //     let contractname = await getContractNameAndSymbol(log.address)
    //     return {"tx-type": "swap", "contract-name": contractname.name};
    // } 
    // else if (log.topics[0].toLowerCase() == syncEvent) {
    //     return "Sync";
    // } else {
    //     return "unknown"
    // }
}


async function getContractNameAndSymbol(contractAddress) {
    const contract = new web3.eth.Contract(ContractNameABI, contractAddress);

    let name = await contract.methods.name().call()
    let symbol = await contract.methods.symbol().call()

    // console.log(name)
    // console.log(symbol)

    return {"name": name, "symbol": symbol}
}

let arr = []

async function logsForwarder(txObj) {
    // console.log("txobj ", txObj)
    let txLogArr = []
    const result = await getlogsOfTxn(txObj.hash)
    // console.log(result)
    // txLogArr.push(result)
    // txLogArr.push({"tx-hash": txObj.hash})
    // console.log("length ",result.logs.length);
    // // console.log("logs",result.logs)
    // // for(let i = 0; i < result.logs.length; i++ ){
    // result.logs.map(async(log) => {
    //     let data = await transactionType(log)
    //     txLogArr.push(data)
    // })
        // console.log("log ", result.logs[i])
        
        // if(data == "Transfer"){
        //     let contractInfo = await getContractNameAndSymbol(result.logs[i].address)
        //         const obj = {
        //             "contract-name": contractInfo.name,
        //             "contract-symbol": contractInfo.symbol,
        //             "contract-address": result.logs[i].address,
        //             "transaction-type": "transfer"
        //         }
        //         txLogArr.push(obj)
        //     // console.log("Push ",txLogArr)
            
        // } else if(data == "Swap") {
        //     let contractInfo = await getContractNameAndSymbol(result.logs[i].address)
        //         const obj = {
        //             "contract-name": contractInfo.name,
        //             "contract-symbol": contractInfo.symbol,
        //             "contract-address": result.logs[i].address,
        //             "transaction-type": "swap"
        //         }
        //         txLogArr.push(obj)
        //     // console.log("Push ",txLogArr)
        // }
    // }
    return {"data": result, "hash": txObj.hash}
    // return result
}



async function getAllUniqueAddress() {
    let contractNamesArr = []
    let result = await getTransaction()
    // let result = resultobj.
    console.log("TX received", count)
    console.log("result length ", result.length)
    // console.log("result ",result)

    for(let j = 0; j < result.length; j++){
        let subArr = []
        for(let i = 0; i < result[j]["data"].length; i++){
            // console.log(typeof(result[j][i]))
            if(typeof(result[j]["data"][i]) == 'object' && (result[j]['data'][i]['transaction-type'] == 'Swap' || result[j]['data'][i]['transaction-type'] == 'Transfer')){
                if(i == 0 || result[j]['data'][i] == result.length - 1){
                    subArr.push(result[j]['data'][i]['contract-address'])
                } else {
                    if(subArr.indexOf(result[j]['data'][i]['contract-address']) == -1){
                        subArr.push(result[j]['data'][i]['contract-address'])
                    }
                }
            }
        }
        const obj = {"hash": result[j]['hash']}
        subArr.push(obj)
        // console.log("arr ", result[j])
        // console.log("subarr ",subArr)
        contractNamesArr.push(subArr)
    }

    // console.log(contractNamesArr)

    return contractNamesArr;
}

// getAllUniqueAddress().then((result) => {
//     console.log(result)
// })

async function getContractNameForArray() {
    let addressesArray = await getAllUniqueAddress()

    for(let j = 0; j < addressesArray.length; j++){
        for(let i = 0 ; i < addressesArray[j].length; i++){
            if(typeof(addressesArray[j][i]) != 'object'){
                let address = addressesArray[j][i]
                addressesArray[j][i] = await getContractNameAndSymbol(addressesArray[j][i])
                addressesArray[j][i]['address'] = address
            } 
            // else {
            //     // addressesArray[j][i]['hash'] = addressesArray[j][i]
            // }
            
        }
    }

    console.log(addressesArray)
    return addressesArray
}

getContractNameForArray().then((data) => {
    console.log(data)
})

// getTransaction().then((result) => {
//     console.log("TX received", count)
//     console.log("result length ", result.length)
//     // console.log("result ",result)

//     for(let j = 0; j < result.length; j++){
//         let subArr = []
//         for(let i = 0; i < result[j].length; i++){
//             // console.log(typeof(result[j][i]))
//             if(typeof(result[j][i]) == 'object' && (result[j][i]['transaction-type'] == 'Swap' || result[j][i]['transaction-type'] == 'Transfer')){
//                 if(i == 0 || result[j][i] == result.length - 1){
//                     subArr.push(result[j][i]['contract-address'])
//                 } else {
//                     if(subArr.indexOf(result[j][i]['contract-address']) == -1){
//                         subArr.push(result[j][i]['contract-address'])
//                     }
//                 }
//             }
//         }
//         // console.log("arr ", result[j])
//         // console.log("subarr ",subArr)
//         contractNamesArr.push(subArr)
//     }

//     console.log(contractNamesArr)
//     return 
// }).then()
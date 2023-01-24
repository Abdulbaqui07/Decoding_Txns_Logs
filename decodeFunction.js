const Web3 = require('web3');

const ContractNameABI = require('./contractNameSymbol.json');
const UniswapTokenABI = require('./uniswapPoolAbi.json');

const web3 = new Web3(
    "https://mainnet.infura.io/v3/585178b4d49e49c59162eee163ccade8"
);

const contractAddress = "0x1111111254eeb25477b68fb85ed929f73a960582"; // the address of your contract

const swapFunctionSig = web3.eth.abi.encodeFunctionSignature("swap(address,(address,address,address,address,uint256,uint256,uint256),bytes,bytes)");
console.log("Function signature of swap : " + swapFunctionSig);
    
const unoswapFunctionSig = web3.eth.abi.encodeFunctionSignature("unoswap(address,uint256,uint256,uint256[])")
console.log("Function signature of unoswap : " + unoswapFunctionSig);


let arr = [];



/**
* @returns txn of specific contract and takes only swap and unoswap function call txns
*/
async function getLogs() {
    const blockNumber = await web3.eth.getBlockNumber();
    console.log("blockNumber", blockNumber);

    for (let i = blockNumber - 10; i <= blockNumber; i++) {
        let getBlock = await web3.eth.getBlock(i, true)

        getBlock.transactions.forEach(async (tx) => {

            if (tx.to !== null && tx.to.toLowerCase() === contractAddress) {
                // console.log("TX ",tx)
                if (tx.input.slice(0, 10) === swapFunctionSig) { // swap
                    arr.push(await swapFn(tx)) 
                } else if (tx.input.slice(0, 10) === unoswapFunctionSig) { // unoswap
                    arr.push(await unoswapFn(tx))
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

async function swapFn(tx) {
    const decodedInput = web3.eth.abi.decodeParameters(
        [
            "address",
            "(address,address,address,address,uint256,uint256,uint256)",
            "bytes",
            "bytes",
        ],
        tx.input.slice(10)
    );


    let dexName = await getLogsDataFromHash(tx.hash)


    const obj = {
        'function-call': "swap",
        //executor: decodedInput[0],
        'srcToken': decodedInput[1][0],
        'destToken': decodedInput[1][1],
        // srcReciever: decodedInput[1][2],
        // destReciever: decodedInput[1][3],
        'srcAmount': decodedInput[1][4], //input amount
        'desAmount': decodedInput[1][5], //return amount
        'dex': dexName,
        'hash': tx.hash
    };

    return obj
}


async function unoswapFn(tx) {
    const decodedInput = web3.eth.abi.decodeParameters(
        [
            "address",
            "uint256",
            "uint256",
            "uint256[]",
        ],
        tx.input.slice(10)
    );

    let dexName = await getLogsDataFromHash(tx.hash)
    let desToken = await getLastLog(tx.hash)


    const obj = {
        'function-call': "unoswap",
        "srcToken": decodedInput[0] == '0x0000000000000000000000000000000000000000' ? 'ETH' : decodedInput[0],
        "srcAmount": decodedInput[1],
        "desToken": desToken,
        "desAmount": decodedInput[2],
        "pools": decodedInput[3],
        "dex": dexName,
        "hash": tx.hash
    }

    return obj
}

/**
 * @param txObj takes obj of transaction
 * @returns object which includes hash and logs object of that transaction hash 
 */
async function getLogsDataFromHash(hash) {
    // getting logs object for specifc tx by hash
    let result = await web3.eth.getTransactionReceipt(hash)

    let data = filterLogsOfspecificTx(result)

    // adding hash of each txn in last
    
    return data
}

/**
 * 
 */
function filterLogsOfspecificTx(logsObj){
    let result = "none"
    let logs = logsObj.logs

    logs.forEach((log) => {
        let dexType = transactionType(log)
        // console.log("dex name ", dexType)
        if(dexType != 'unknown'){
            result = dexType
        } 
    })
    return result
}

/**
 * 
 */
function transactionType(log) {
    // console.log(log)
    // hash of events 
    let transferEvent = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
    let approvalEvent = "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925";
    let depositEvent = "0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c";
    let withdrawelEvent = "0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65";
    let uniswapSwapEvent = "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822";
    let balancerSwapEvent = "0x2170c741c41531aec20e7c107c24eecfdd15e69c9bb0a8dd37b1840b9e0b207b";
    let curvefiEvent = "0xb2e76ae99761dc136e598d4a629bb347eccb9532a5f8bbd72e18467c3c34cc98"
    let curvefiTokenExchangeEvent = "0x8b3e96f2b889fa771c53c981b40daf005f63f637f1869f707052d15a3dd97140"
    let uniswapv3Event = "0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67"
    let zeroxprotocalFillEvent = "0x0bcc4c97732e47d9946f229edb95f5b6323f601300e4690de719993f3c371129" 
    let sushiswapSwapEvent = "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822"
    let syncEvent = "0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1";

    if(log.topics[0].toLowerCase() == uniswapSwapEvent) {
        return 'uniswapV2';
    } else if(log.topics[0].toLowerCase() == balancerSwapEvent){
        return 'balancer'
    } else if(log.topics[0].toLowerCase() == curvefiEvent || log.topics[0].toLowerCase() == curvefiTokenExchangeEvent){
        return 'curve.fi'
    } else if(log.topics[0].toLowerCase() == uniswapv3Event){
        return 'uniswapV3'   
    } else if (log.topics[0].toLowerCase() == zeroxprotocalFillEvent){
        return '0xprotocal'
    } else if(log.topics[0].toLowerCase() == sushiswapSwapEvent){
        return 'sushiSwap'
    }
    else {
        return 'unknown'
    }
}


async function getLastLog(hash) {
    // getting logs object for specifc tx by hash
    let result = await web3.eth.getTransactionReceipt(hash)
    let length = result.logs.length
    let lastLog = result.logs[length - 1]
    // console.log("last log", lastLog, "hash ", hash)
    if(lastLog){
        return await logToTokenAddress(lastLog)
    }else {
        return "txFailed"
    }
    
}


async function logToTokenAddress(log){

    let uniswapV2SwapEvent = "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822";
    let wethWidthdrawEvent = "0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65";

    if(log.topics[0].toLowerCase() == uniswapV2SwapEvent){
        return await decodeSwapEventForTokenAddress(log)
    } else if(log.topics[0].toLowerCase() == wethWidthdrawEvent){
        return "ETH"
    } 
    else {
        return 'OtherEvent'
    }
}

/**
 * @param log takes a specific log and access topics array
 * @returns decode output in object
 */
function swapEventFn(log) {
    let topicArr = []
    
    for (let i = 1; i < log.topics.length; i++) {
        topicArr.push(log.topics[i])
    }
    
    let res = web3.eth.abi.decodeLog(
        [
            {
                "indexed": true,
                "name": "sender",
                "type": "address"
            },
            {
                "name": "amount0In",
                "type": "uint256"
            },
            {
                "name": "amount1In",
                "type": "uint256"
            },
            {
                "name": "amount0Out",
                "type": "uint256"
            },
            {
                "name": "amount1Out",
                "type": "uint256"
            },
            {
                "indexed": true,
                "name": "to",
                "type": "address"
            }
        ],
        log["data"],
        topicArr
    );

    return {
        "contract-address": log.address,
        "transaction-type": "Swap",
        "value": {
            "sender": res.sender,
            "amount0In": res.amount0In,
            "amount1In": res.amount1In,
            "amount0Out": res.amount0Out,
            "amount1Out": res.amount1Out,
            "to": res.to,
        }
    }
}

async function decodeSwapEventForTokenAddress(log){
    let decodeObj = swapEventFn(log)
    if(decodeObj.value.amount0Out == 0){
        return await getTokenAddress('token1',log.address)
    }else {
        return await getTokenAddress('token0',log.address)
    }
}

async function getTokenAddress(name, contractAddress){
    const contract = new web3.eth.Contract(UniswapTokenABI, contractAddress);
    if(name == 'token0'){
        return await contract.methods.token0().call()
    }else {
        return await contract.methods.token1().call()
    }
}


getLogs().then((result) => {
    console.log("length ",result.length)
    console.log(result)
})
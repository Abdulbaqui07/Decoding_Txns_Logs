const Web3 = require('web3');

const ContractNameABI = require('./contractNameSymbol.json');

const web3 = new Web3(
    "https://mainnet.infura.io/v3/585178b4d49e49c59162eee163ccade8"
);


async function getlogsOfTxn(tx) {
    let result = await web3.eth.getTransactionReceipt(tx)

    // return result2;
    let filterData = filterTxn(result)
    return filterData
}

function filterTxn(txnObj) {
    let result = []
    let logs = txnObj.logs

    logs.forEach((log) => {
        let txtype = transactionType(log)
        result.push(txtype)
    })


    return result

    // console.log(result, result.length)
}

function transactionType(log) {
    // console.log(log)
    // hash of events 
    let transferEvent = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
    let approvalEvent = "0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925";
    let depositEvent = "0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c";
    let withdrawelEvent = "0x7fcf532c15f0a6db0bd6d0e038bea71d30d808c7d98cb3bf7268a95bf5081b65";
    let swapEvent = "0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822";
    let syncEvent = "0x1c411e9a96e071241c2f21f7726b17ae89e3cab4c78be50e062b03a9fffbbad1";

    if (log.topics[0].toLowerCase() == transferEvent) {
        return transferEventFn(log)
    } else if (log.topics[0].toLowerCase() == approvalEvent) {
        return approvalEventFn(log)
    } else if (log.topics[0].toLowerCase() == depositEvent) {
        return "depositEvent";
    } else if (log.topics[0].toLowerCase() == withdrawelEvent) {
        return withdrawelEventFn(log);
    } else if (log.topics[0].toLowerCase() == swapEvent) {
        return swapEventFn(log);
    } else if (log.topics[0].toLowerCase() == syncEvent) {
        return syncEventFn(log);
    } else {
        return "unknown"
    }
}

function transferEventFn(log) {
    let topicArr = []

    for (let i = 1; i < log.topics.length; i++) {
        topicArr.push(log.topics[i])
    }

    let res = web3.eth.abi.decodeLog(
        [
            {
                "indexed": true,
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        log["data"],
        topicArr
    );

    return {
        "contract-address": log.address,
        "transaction-type": "Transfer",
        "value": {
            "from": res.from,
            "to": res.to,
            "value": res.value
        }
    }
    
}

function approvalEventFn(log) {
    let topicArr = []
    
    for(let i = 1; i < log.topics.length; i++) {
        topicArr.push(log.topics[i]);
    }

    let res = web3.eth.abi.decodeLog(
        [
            {
                "indexed": true,
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "name": "value",
                "type": "uint256"
            }
        ],
        log["data"],
        topicArr
    );

    return {
        "contract-address": log.address,
        "transaction-type": "Approve",
        "value": {
            "owner": res.owner,
            "spender": res.spender,
            "value": res.value
        }
    }
}

function syncEventFn(log) {
    let topicArr = []

    for (let i = 1; i < log.topics.length; i++) {
        topicArr.push(log.topics[i])
    }

    let res = web3.eth.abi.decodeLog(
        [
            {
                "name": "reserve0",
                "type": "uint112"
            },
            {
                "name": "reserve1",
                "type": "uint112"
            }
        ],
        log["data"],
        topicArr
    );

    return {
        "contract-address": log.address,
        "transaction-type": "Sync",
        "value": {
            "reserve0": res.reserve0,
            "reserve1": res.reserve1
        }
    }
    
}

function withdrawelEventFn(log) {
    let topicArr = []

    for (let i = 1; i < log.topics.length; i++) {
        topicArr.push(log.topics[i])
    }
    
    let res = web3.eth.abi.decodeLog(
        [
            {
                "indexed": true,
                "name": "src",
                "type": "address"
            },
            {
                "name": "wad",
                "type": "uint256"
            }
        ],
        log["data"],
        topicArr
    );

    return {
        "contract-address": log.address,
        "transaction-type": "Withdrawal",
        "value": {
            "src": res.src,
            "wad": res.wad
        }
    }
}

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

// function unknown(log) {
//     let res = web3.eth.abi.decodeLog(

//         log["data"],
//         topicArr
//     );
// }

async function getContractName(contractAddress) {
    const contract = new web3.eth.Contract(ContractNameABI, contractAddress);

    let name = await contract.methods.name().call()
    let symbol = await contract.methods.symbol().call()

    // console.log(name)
    // console.log(symbol)

    return {"name": name, "symbol": symbol}
}


// 0x606bc694c3599fafe05d00497a779adb158cb9d7612ca7bd17529ca18aa4f2b8
async function main() { //hash
    const data = await getlogsOfTxn('0x606bc694c3599fafe05d00497a779adb158cb9d7612ca7bd17529ca18aa4f2b8')
    for(let i = 0; i< data.length; i++){
        let nameNsymbol = await getContractName(data[i]['contract-address'])
        data[i]['contract-name'] = nameNsymbol.name
        data[i]['contract-symbol'] = nameNsymbol.symbol
    }
    console.log(data)
}
main() 
// 0x0670943a23aad4595061897944d4e78a938ff9297585600137646b04067d197b

// getContractName('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48').then((data) => {
//     console.log(data)
// })

module.exports = {getlogsOfTxn, filterTxn, transactionType, getContractName, main} 
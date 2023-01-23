const { getlogsOfTxn, filterTxn, transactionType } = require("./decodingLogs");

const Web3 = require("web3");
const web3 = new Web3(
  "https://mainnet.infura.io/v3/585178b4d49e49c59162eee163ccade8"
);

const contractAddress = "0x1111111254eeb25477b68fb85ed929f73a960582"; // the address of your contract
const contractABI = require("./abi.json");

const contract = new web3.eth.Contract(contractABI, contractAddress);


async function getLogs() {
  let logsArray = []
  let blockNumber = await web3.eth.getBlockNumber()

    console.log("blockNumber", blockNumber);

    let logs = await contract.events.allEvents(
      {
        fromBlock: blockNumber - 10
      },function(error, result){
        if(error){
          console.log(error)
        }
        console.log(result)
      });
      return logs
}

getLogs()

async function main() {
  let filterObjArr = []
  let resultArr = await getLogs()
  console.log("Result recevied",resultArr)
  resultArr.forEach((log) => {
    let filterObj = transactionType(log.raw)
    console.log("Filter Object ",filterObj)
    filterObjArr.push(filterObj)
  })
  console.log(filterObjArr.length)
}

// main()












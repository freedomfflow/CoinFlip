var web3 = new Web3(Web3.givenProvider);

// Declare var we will load contract instance to
var contractInstance;
var bettorEthAddress;

// Create a contract instance in Javascript so we can interact with it - replicates contract instance in blockchaing
//  by wrapping in some javascript magic so we can then call functions in contract
// Web3 has helper functions for this

$(document).ready(function() {
    // This brings up box for user permission for web page to access MetaMask
    // Returns a promise, so when permission granted, we can do our thing
    // 'Accounts' is an array of address supplied by MetaMask - will be the main address used by MetaMask

    // 'abi' is available after contract is deployed in truffle
    //  go into project, build folder, and look for json file (People.json) and within this config, near top, you will
    //   see 'abi' array -- copy the whole thing!!
    //    - create new file in dapp folder called 'abi.js' and assign to var there
    //  for 'address', redeploy People (migrate --reset from truffle console), and in the output of that,
    //    copy 'contract address:'
    //  'accounts[0]' is the address of whomever is using the contract
    window.ethereum.enable().then((accounts) => {
        // assign contract address for CoinFlipWager.sol we get after compile
        let contractAddress = '0xa2445fd542A88ed425e6ef961AB1fEc5853F95c3';

        // create new contract instance
        contractInstance = new web3.eth.Contract(abi, contractAddress, {from: accounts[0]});

        bettorEthAddress = accounts[0];

        // Display house and bettor balances
        getBalances('0xf463361c462Ac96F7124D41f7f27e13cE161DF90', bettorEthAddress);
    });

    // Click Handler for submitting form to flip the coin to win or lose amount wagered
    $("#flip").click(flipCoin);

    $('#betOption').focus(() => {
        $('#status-msg').html("");
    })

    $('#wagerAmount').focus(() => {
        $('#status-msg').html("");
    })

    $('#flip').click(flipCoin);

});

// Get's balances of the 'house' and 'bettor' (contract user) addresses
//  Updates screen using jquery
//  Also returns balances for using contracts
async function getBalances(houseWalletAddress, bettorAddress) {
    let houseBalance = '';
    let bettorBalance = '';

    // get the house balance
    await web3.eth.getBalance(houseWalletAddress, (error, result) => {
        if (!error) {
            houseBalance = parseFloat(web3.utils.fromWei(result, "ether"));
        }
        $('#display-house-balance').html(houseBalance + ' ETH');
    });

    await web3.eth.getBalance(bettorAddress, (error, result) => {
        if (!error) {
            bettorBalance = parseFloat(web3.utils.fromWei(result), "ether");
            $('#display-bettor-balance').html(bettorBalance + ' ETH');
        }
    });

    return {houseBalance: houseBalance, bettorBalance: bettorBalance}
}

function flipCoin() {
    let validated = true;
    let betOption = $("#betOption option:selected").val();
    let betAmount = $('#wagerAmount').val() > 0 ? $('#wagerAmount').val() : "0";

    console.log('setting validated to true');

    // Validate Input
    if (betOption === 'choose' || betAmount === 0) {
        $('#status-msg').html("You must select 'Heads/Tails' & wager an amount > 0");
        validated = false;
        console.log('changing validated to false 1');
    }

    // Get bettorAccount
    console.log('bettor addr');
    console.log(bettorEthAddress);

    // Get balances to re-verify
    preBetBalances =  getBalances('0xf463361c462Ac96F7124D41f7f27e13cE161DF90', bettorEthAddress);
    console.log('pre bet bal');
    console.log(preBetBalances);
    console.log('bet amount = ' + betAmount);
    // verify balances
    if (betAmount > preBetBalances.houseBalance || betAmount > preBetBalances.bettorBalance) {
        $('#status-msg').html("You can't bet more than either your balance or the house balance");
        validated = false;
        console.log('changing validated to false 2');
    }

    // json object arg for send
    let config = {
        betOption: betOption,
        betAmount: web3.utils.toWei(betAmount, "ether"),
    }

    console.log('validated  = ' + validated);
    if (validated) {
        console.log('config = ');
        console.log(config);
    }

    contractInstance.methods.placeWager(betOption, web3.utils.toWei(betAmount, "ether")).send();

    // Call contract methods
    // send() method transmits our transaction data to chain
    // we use a 'on()' event listener to listen for a custom function so we can detect completed transaction and
    //  notify the user
    // contractInstance.methods.createPerson(name, age, height).send(config)
    //     .on("transactionHash", (hash) => {
    //         console.log('Hash');
    //         console.log(hash);
    //     })
    //     .on("confirmation", (confirmationNbr) => {
    //         // This is confirmations number - most important from coding standpint
    //         console.log('Confirmation Number');  // note - no conf in test nets, so we won't see this
    //         console.log(confirmationNbr);
    //     })
    //     .on("receipt", (receipt) => {
    //         // receipt is outcome of txn - i.e. when block firstly mined, we get a receipt
    //         console.log('Receipt');
    //         console.log(receipt);
    //         alert("Done");
    //     });
}

function fetch() {
    // Since a getter, we aren't waiting for confirmation (i.e. txn getting mined and waiting for reply)
    contractInstance.methods.getPerson().call().then((result) => {
        console.log('Result = ');
        console.log(result);

        // Set data on screen
        $("#name_output").text(result.name);
        $("#age_output").text(result.age);
        $("#height_output").text(result.height);
    })
}
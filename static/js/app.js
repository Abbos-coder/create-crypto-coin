const bscUrl = 'https://bscscan.com/tx/';
let currentAccount = null;
let web3;

let factory;
let currentFactory = 'StandardToken';
loadFactory(currentFactory);

// Mainnet:

// 0xf84a9336665e0760f9B953D559AEdBCaF1E6A631 StandardTokenFactory        
// 0xA6F4B783a596777CB48121b03BEC93aB534C1f2D AntiBotStandartTokenFactory 
// 0x045D449C2608CF48c1603da0ae17b89eC7e4be53 BabyTokenFactory     
// 0xa10AD3C29a4265327A414A9f0Db60049eE700FE5 AntiBotBabyTokenFactory       
// 0x8EFDb3b642eb2a20607ffe0A56CFefF6a95Df002 AntiBot
// 0x10ED43C718714eb63d5aA57B78B54704E256024E Pancake Router   
// 0x8a1bFeE3cfD21bebd5b20c3B625dbd792513395D MyTeamCoinRouter
// 0x2B93f5dCeFc8427C58CA02Dd254Ea4e31FC105fd TokenFactoryManager

// TestNet

// 0xE5D946A10A1381668CC74676B59842348a065d80 StandardTokenFactory        
// 0x3203e12E7AA05a773F90386Cfb96f5153b2B7418 AntiBotStandartTokenFactory
// 0xDD87Af740ca0df03D9d7E582d3386447B125145a BabyTokenFactory     
// 0xF3b8eD6E61339061D4f760DeB211B61E4F2b4817 AntiBotBabyTokenFactory   
// 0xbb06F5C7689eA93d9DeACCf4aF8546C4Fe0Bf1E5 antiBot       
// 0xD99D1c33F9fC3444f8101754aBC46c52416550D1 Pancake Router              

function loadFactory(name) {
  $.getJSON(`${name}Factory.json`, function (result) {
    factory = result;
    currentFactory = name;
    if (currentFactory === "StandardToken") {
      $('.decimals > .invalid-f').attr('class', 'invalid-feedback');
      $('.decimals').show();
      $('.router').hide();
      $('.row > .col > .invalid-feedback').attr('class', 'invalid-f');
      $('.row').hide();
    } else {
      $('.decimals').hide();
      $('.decimals > .invalid-feedback').attr('class', 'invalid-f');
      $('.router').show();
      $('.row > .col > .invalid-f').attr('class', 'invalid-feedback');
      $('.row').show();
    }
    console.log(`${name}Factory loaded`);
  });
}


function handleAccountsChanged(accounts) {
  console.log('Calling HandleChanged')

  if (accounts.length === 0) {
    console.log('Please connect to MetaMask.');
    $('#enableMetamask').html('Connect with Metamask')
  } else if (accounts[0] !== currentAccount) {
    currentAccount = accounts[0];
    // $("#marketing-wallet").attr("pattern", `^(?!(${currentAccount}|${web3.utils.toChecksumAddress(currentAccount)})$).*$`);
    $('#status').html('')

    if (currentAccount != null) {
      // Set the button label
      $('#enableMetamask').html(currentAccount.slice(0, 5) + '...' + currentAccount.slice(-5))
    }
  }
  console.log('WalletAddress in HandleAccountChanged =' + currentAccount)
}

function switch_network() {
  window.ethereum.request({
    method: 'wallet_addEthereumChain',
    params: [{
    chainId: '0x38',
    chainName: 'Binance Smart Chain',
    nativeCurrency: {
        name: 'Binance Coin',
        symbol: 'BNB',
        decimals: 18
    },
    rpcUrls: ['https://bsc-dataseed.binance.org/'],
    blockExplorerUrls: ['https://bscscan.com']
    }]
    })
    .catch((error) => {
      console.log(error)
    }); 
}

function connect() {
  console.log('Calling connect()');
  web3 = new Web3(window.ethereum);
  switch_network();
  window.ethereum
      .request({method: 'eth_requestAccounts'})
      .then(handleAccountsChanged)
      .catch(handleError);
}

function handleError(err) {
  if (err.code === 4001) {
    // EIP-1193 userRejectedRequest error
    // If this happens, the user rejected the connection request.
    $('#status').html('You denied transaction signature/MetaMask connection!');
    $('#spinner').css('visibility', 'hidden');
    $('#create-btn').prop('disabled', false);
  } else {
    console.error(err);
  }
}

function detectMetaMask() {
  if (typeof window.ethereum !== 'undefined') {
    return true;
  } else {
    return false;
  }
}

function areValid(isBaby) {
  valid = true;
  $('.invalid-feedback').each(function (index, value) {
    if ($(value).css('display') !== 'none') {
      console.log('Invalid field: ', index, $(value))
      valid = false;
    }
  });
  return valid;
}


async function createBabyToken() {
  console.log('Create BabyToken');
  name = $('#name').val();
  symbol = $('#symbol').val().toUpperCase();
  totalSupply = $('#supply').val().toString() + '0'.repeat(18);
  minBalance = $('#min-balance').val().toString() + '0'.repeat(18);
  rewardFee = $('#reward-fee').val();
  liquidityFee = $('#liquidity-fee').val();
  marketingFee = $('#marketing-fee').val();
  marketingWallet = web3.utils.toChecksumAddress($('#marketing-wallet').val());

  let addrs;
  let router;

  if ($("#router option:selected").text() === "MyTeamCoin") {
    router = factory.MYCRouter;
  } else {
    router = factory.pancakeRouter;
  }

  addrs = [currentAccount, factory.rewardToken, router, marketingWallet];

  const tokenFactory = new web3.eth.Contract(factory.abi, factory.address);

  tokenFactory.methods.create(addrs, name, symbol, totalSupply, rewardFee, liquidityFee, marketingFee, minBalance).send({
    from: currentAccount,
    value: web3.utils.toWei("0.1", 'ether')
  }).then(showResult).catch(handleError);
}

async function createStandardToken() {
  console.log('Create StandardToken');
  name = $('#name').val();
  symbol = $('#symbol').val().toUpperCase();
  decimals = parseInt($('#decimals').val());
  totalSupply = $('#supply').val().toString() + '0'.repeat(decimals);
  
  const tokenFactory = new web3.eth.Contract(factory.abi, factory.address);
  
  tokenFactory.methods.create(name, symbol, decimals, totalSupply).send({
    from: currentAccount,
    value: web3.utils.toWei("0.1", 'ether')
  }).then(showResult).catch(handleError);
}


async function create() {
  $('#status').html('');
  chainId = await web3.eth.getChainId();
  if (chainId !== 56) {
    switch_network();
    return
  }
  $('#creation-form').addClass('was-validated');
  if (areValid(currentFactory === 'BabyToken')) {
    $('#spinner').css('visibility', 'visible');
    $('#create-btn').prop('disabled', true);
    $('.success-alert').hide();
    $('.success-alert').empty();
    if (currentFactory === 'StandardToken') {
      createStandardToken().catch(showError);
    } else {
      createBabyToken().catch(showError);
    }
  } else {
    console.log('Invalid input data');
  }
}

function showError(err) {
    $('#status').html(err);
    $('#spinner').css('visibility', 'hidden');
    $('#create-btn').prop('disabled', false);
}


function showResult(result) {
  console.log(result);  
  let txUrl = bscUrl + result.transactionHash;
  let tokenAddress = result.events.TokenCreated.returnValues.token;
  let congratulatins = '<h4 class="alert-heading">Congratulations!</h4>'
  let info = `<p>Your ${symbol} token was created!</p>`;
  let urlText = `<p>Check it out on BSCscan: <a href="${txUrl}" target="_blank" rel="noopener noreferrer">${txUrl}</a></p>`;
  let contractAddressInfo = `<p>Contract address: <b>${tokenAddress}</b></p>`;
  $('.success-alert').append(congratulatins, info, urlText, contractAddressInfo);
  $('.success-alert').show();
  $('#spinner').css('visibility', 'hidden');
  $('#create-btn').prop('disabled', false);
}


$(document).ready(function () {
  m = detectMetaMask()
  if (m) {
    $('#enableMetamask').attr('disabled', false)
    connect(); // Make sure the connected wallet is being returned
  } else {
    $('#enableMetamask').attr('disabled', true)
  }

  $('#enableMetamask').click(function () {
    connect();
  });

  $('#create-btn').click(function () {
    create();
  });

  $('#marketing-wallet').on('input', function (e) {
    if (e.target.value.toLowerCase() === currentAccount.toLowerCase()) {
      $("#marketing-wallet").attr("pattern", `^(?!${e.target.value}$).*$`);
      $('#invalid-marketing-wal').html('Owner and marketing wallet cannot be the same');
      $('#creation-form').addClass('was-validated');
    } else {
      $('#invalid-marketing-wal').html('Address is invalid');
    }
  });

  $('#token-type').change(function () {
    if (this.value === "Standard Token") {
      loadFactory('StandardToken');
    } else {
      loadFactory('BabyToken');
    }
  });
  
});
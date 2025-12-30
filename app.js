document.addEventListener("DOMContentLoaded", () => {
  const AEC_CONTRACT = "TNKPo4vCEARpZQHb9YCYKDjTvZWxNrf5mL";
  const DECIMALS = 6;
  let tronWeb = null;
  let userAddress = null;

  const connectBtn = document.getElementById("connectBtn");
  const walletStatus = document.getElementById("walletStatus");
  const walletAddress = document.getElementById("walletAddress");
  const aecBalance = document.getElementById("aecBalance");
  const sendBtn = document.getElementById("sendBtn");
  const sendToInput = document.getElementById("sendTo");
  const sendAmountInput = document.getElementById("sendAmount");

  async function waitTronLink() {
    return new Promise((resolve, reject) => {
      let t=0;
      const timer = setInterval(()=>{
        if(window.tronWeb && window.tronWeb.ready){clearInterval(timer); resolve(window.tronWeb);}
        if(++t>20){clearInterval(timer); reject();}
      },300);
    });
  }

  async function connectWallet() {
    try {
      tronWeb = await waitTronLink();
      await tronWeb.request({ method:"tron_requestAccounts" });
      userAddress = tronWeb.defaultAddress.base58;
      if(!userAddress) throw 0;
      walletStatus.innerText = "Connected";
      walletAddress.innerText = userAddress;
      connectBtn.style.display = "none";
      loadAECBalance();
    } catch { alert("Open this site using TronLink wallet"); }
  }

  async function loadAECBalance() {
    if(!tronWeb || !userAddress) return;
    try{
      const token = await tronWeb.contract().at(AEC_CONTRACT);
      const bal = await token.balanceOf(userAddress).call();
      aecBalance.innerText = (Number(bal)/10**DECIMALS).toLocaleString() + " AEC";
    } catch { aecBalance.innerText="—"; }
  }

  async function sendToken(){
    if(!tronWeb||!userAddress){alert("Connect wallet first"); return;}
    const to = sendToInput.value.trim();
    const amount = Number(sendAmountInput.value);
    if(!tronWeb.isAddress(to)){alert("Invalid recipient"); return;}
    if(amount<=0){alert("Invalid amount"); return;}
    try{
      const contract = await tronWeb.contract().at(AEC_CONTRACT);
      const value = Math.floor(amount*10**DECIMALS);
      document.getElementById("txStatus").innerText="Confirm transaction in TronLink...";
      await contract.transfer(to,value).send();
      document.getElementById("txStatus").innerText="✅ Transfer successful";
      loadAECBalance();
      sendToInput.value=""; sendAmountInput.value="";
    } catch(err){console.error(err); document.getElementById("txStatus").innerText="❌ Transaction failed";}
  }

  connectBtn.onclick = connectWallet;
  sendBtn.onclick = sendToken;

  // Coin ticker
  async function loadTopCoinsTicker(){
    try{
      const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1");
      const coins = await res.json();
      const ticker = document.getElementById("tickerContent");
      ticker.innerHTML="";
      coins.forEach(c=>{
        const item = document.createElement("div");
        item.className="ticker-item";
        item.innerHTML=`<img src="${c.image}" alt="${c.symbol}">${c.symbol.toUpperCase()}<span>$${c.current_price.toLocaleString()}</span>`;
        ticker.appendChild(item);
      });
    } catch {document.getElementById("tickerContent").innerText="Failed to load market data";}
  }
  loadTopCoinsTicker(); setInterval(loadTopCoinsTicker,120000);

  // Crypto news
  async function loadCryptoNews(){
    try{
      const res = await fetch("https://api.rss2json.com/v1/api.json?rss_url=https://www.coindesk.com/arc/outboundfeeds/rss/");
      const data = await res.json();
      const container = document.getElementById("newsContainer"); container.innerHTML="";
      data.items.slice(0,6).forEach(item=>{
        container.innerHTML+=`<div class="news-card"><h4>${item.title}</h4><a href="${item.link}" target="_blank">Read more →</a></div>`;
      });
    } catch {document.getElementById("newsContainer").innerText="Failed to load crypto news";}
  }
  loadCryptoNews(); setInterval(loadCryptoNews,300000);

  // Music
  const music = document.getElementById("bgMusic");
  const gate = document.getElementById("soundGate");
  const musicBtn = document.getElementById("musicBtn");
  music.volume=0.25; music.muted=true; music.play().catch(()=>{});
  window.toggleMusic=function(){music.muted=!music.muted; musicBtn.innerText=music.muted?"🔇":"🔊"; if(!music.muted && music.paused) music.play().catch(()=>{});}
  if(gate){gate.addEventListener("click",()=>{music.muted=false; music.play().catch(()=>{}); gate.remove(); musicBtn.innerText="🔊";});}

});


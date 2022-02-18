import "./styles/App.css";
import { SiTwitter } from "react-icons/si";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import MyNFCat from "./utils/MyNFCat.json";
// import { BsFillMoonFill, BsFillSunFill } from "react-icons/bs";

const TWITTER_HANDLE = "mataspigaga";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK =
  "https://testnets.opensea.io/collection/mynfcat-rd9kpjakou";
// const TOTAL_MINT_COUNT = 50;

const CONTRACT_ADDRESS = "0x940271C150d6d40b8a537783F7ac570ee16ae997";

const App = () => {
  // const [darkMode, setDarkMode] = useState(false);
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // const darkModeHandler = () => {
  //   setDarkMode((prevMode) => !prevMode);
  // };

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    // Check if we're authorized to user's wallet
    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);

      setupEventListener();
    } else {
      console.log("No authorized account found");
    }

    let chainId = await ethereum.request({ method: "eth_chainId" });
    console.log("Connected to chain " + chainId);

    // String, hex code of the chainId of the Rinkebey test network
    const rinkebyChainId = "0x4";
    if (chainId !== rinkebyChainId) {
      alert(
        "You are not connected to the Rinkeby Test Network! Get Test ETH here: https://faucets.chain.link/rinkeby"
      );
    }
  };

  // This runs our function when the page loads.
  useEffect(() => {
    checkIfWalletIsConnected();
  });

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      // Fancy method to request access to account.
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      // This should print out public address once we authorize Metamask.
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };

  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          MyNFCat.abi,
          signer
        );

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(
            `Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
        });

        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          MyNFCat.abi,
          signer
        );

        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.makeAnEpicNFT();

        setIsLoading(true);
        console.log("Mining...please wait.");
        await nftTxn.wait();

        setIsLoading(false);
        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button
      onClick={connectWallet}
      className="cta-button connect-wallet-button"
    >
      Connect to Wallet
    </button>
  );

  const renderMintNFTContainer = () => (
    <button
      onClick={askContractToMintNft}
      className="cta-button connect-wallet-button"
    >
      {isLoading ? "Mining..." : "Mint NFT"}
    </button>
  );

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">MyNFCat</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT cat today.
          </p>
          {currentAccount === ""
            ? renderNotConnectedContainer()
            : renderMintNFTContainer()}
          <a href={OPENSEA_LINK} target="_blank" rel="noreferrer">
            <button className="cta-button collection-button">
              View Collection on OpenSea
            </button>
          </a>
        </div>
        <div className="footer-container">
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >
            <SiTwitter className="twitter-logo" />
          </a>
          {/* <div onClick={darkModeHandler} className="darkMode-button">
            {darkMode ? <BsFillSunFill /> : <BsFillMoonFill />}
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default App;

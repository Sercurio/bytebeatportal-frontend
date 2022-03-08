import React, { useEffect, useState } from "react";
import "./App.css";

import { ethers } from "ethers";

import  abi from "./utils/ByteBeatPortal.json"

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [loading, setLoading] = useState(false)
  const [bbFormula, setBbFormula] = useState("");

  const contractAddress = "0x146c4B82497b9ae6ce4FA151F57e1cd8B9dCDa5C";

  const contractABI =  abi.abi;

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const formula = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const bbPortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let formula = await bbPortalContract.getFormula();
        setBbFormula(formula);
        console.log("Retrieved current formula...", formula);

        /*
        * Execute the actual wave from your smart contract
        */
        const bbTxn = await bbPortalContract.updateFormula("t*t");
        console.log("Mining...", bbTxn.hash);
        
        setLoading(true)
        await bbTxn.wait();
        setLoading(false)
        console.log("Mined -- ", bbTxn.hash);

        formula = await bbPortalContract.getFormula();
        console.log("Retrieved current formula: %s", formula);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
}


  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        Hey there!
        </div>

        <div className="bio">
          I am farza and I worked on self-driving cars so that's pretty cool right? Connect your Ethereum wallet and wave at me!
        </div>

        <button className="button" onClick={formula}>
          GetCurrentFormula
        </button>

        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount  && (
          <button className="button" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        <div className="displayFormula" style={{display:'flex', justifyContent:'center'}}>
        {loading ? <div>Loading</div> : bbFormula}
          </div>
        
      </div>
    </div>
  );
}

export default App
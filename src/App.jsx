import React, { useEffect, useState } from "react";
import "./App.css";

import { ethers } from "ethers";

import  abi from "./utils/ByteBeatPortal.json"

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [loading, setLoading] = useState(false)
  const [inputAddFormula, setInputAddFormula] = useState("");
  const [bbFormulas, setBbFormulas] = useState([]);

  const contractAddress = "0x256bE7E2A61e60BABB08c97A688017230F406EC6";

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

  const getFormulas = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const bbPortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let formulas = await bbPortalContract.getFormulas();
        let formulasCleaned = [];
        formulas.forEach(formula => {
          formulasCleaned.push({
            sender: formula.sender,
            timestamp: new Date(formula.timestamp * 1000),
            formula: formula.formula
          });
        });

        setBbFormulas(formulasCleaned);
        console.log("Retrieved formulas...", formulas);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
}

const addFormula=async (e)=>{
e.preventDefault();
try {
  const { ethereum } = window;

  if (ethereum) {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const bbPortalContract = new ethers.Contract(contractAddress, contractABI, signer);

    const bbTxn = await bbPortalContract.addFormula(inputAddFormula);
    console.log("Mining...", bbTxn.hash);
    
    setLoading(true)
    await bbTxn.wait();
    setLoading(false)
    console.log("Mined -- ", bbTxn.hash);

    setInputAddFormula("");

    getFormulas();
  } else {
    console.log("Ethereum object doesn't exist!");
  }
} catch (error) {
  console.log(error);
}

}

const onChangeAddFormulaHandler = (e)=>{
  setInputAddFormula(e.target.value);
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
          Website for adding bytebeat formulas interacting with ethereum blockchain
        </div>

        <button className="button" onClick={getFormulas}>
          getFormulas
        </button>
        <form style={{alignSelf:"center", marginTop:"8px"}} onSubmit={addFormula}>
        <input onChange={onChangeAddFormulaHandler} type="text" value={inputAddFormula}></input>
        <button className="button" type="submit">
          addFormula
        </button>
        </form>
        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount  && (
          <button className="button" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
        <div className="displayFormula" style={{display:'flex', justifyContent:'center'}}>
        {loading ? <div>Loading</div> : (<div style={{display:"flex", flexWrap:"wrap"}}>{bbFormulas.map((formula, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {formula.sender}</div>
              <div>Time: {formula.timestamp.toString()}</div>
              <div>Formula: {formula.formula}</div>
            </div>)
        })}</div>)
      }
          </div>
        
      </div>
    </div>
  );
}

export default App
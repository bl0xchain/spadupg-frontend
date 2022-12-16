
import { sendTransaction } from "../utils";
import { getDecimals, getFromDecimals, getCurrencyName } from "./tokens.service";
import web3 from "../web3";

const contractSpadActionABI = require("../../abis/spad-actions-abi.json");
export const actionContractAddress = "0xC5A76703DDD390dB4C43499d546Fbc3aEcf30F04";
export const spadActionsContract = new web3.eth.Contract(
    contractSpadActionABI, actionContractAddress
);

const contractSpadFactoryABI = require("../../abis/spad-factory-abi.json");
export const factoryContractAddress = "0x0eA97e9f0FFDa7e9f58dfF7AACEB70d8F19FD85E";
export const spadFactoryContract = new web3.eth.Contract(
    contractSpadFactoryABI, factoryContractAddress
);

const contractSpadABI = require("../../abis/spad-abi.json");

class SpadService {

    async getSpadAddresses() {
        const spadCount = await spadFactoryContract.methods.getSpadCount().call();
        var spadAddresses = [];
        var spadAddress;
        for (var i = (parseInt(spadCount) - 1); i >= 0; i--) {
            spadAddress = await spadFactoryContract.methods.spads(i).call();
            spadAddresses.push(spadAddress);
        }
        return spadAddresses;
    }

    async createSPAD(address, name, tokenSymbol, tokenTotalSupply, target, minInvestment, maxInvestment, passKey, _currencyAddress) {
        if (!window.ethereum || address === null || address === "") {
            return {
                status: "💡 Connect your Metamask wallet to create SPAD.",
                code: 403
            };
        }

        const currencyAddress = (_currencyAddress == "") ? '0x0000000000000000000000000000000000000000' : _currencyAddress;

        const data = spadFactoryContract.methods.createSPAD(name, tokenSymbol, getDecimals(_currencyAddress, tokenTotalSupply), getDecimals(_currencyAddress, target), getDecimals(_currencyAddress, minInvestment), getDecimals(_currencyAddress, maxInvestment), passKey, currencyAddress).encodeABI();
        const value = 0;

        return await sendTransaction(address, factoryContractAddress, data, value);
    }

    getSpadContract(spadAddress) {
        return new web3.eth.Contract(
            contractSpadABI,
            spadAddress
        );
    }

    async getSpadDetails(spadAddress) {
        const spadContract = this.getSpadContract(spadAddress);
        const spadDetails = {};
        spadDetails.name = await spadContract.methods.name().call(); 
        spadDetails.target = await spadContract.methods.target().call();
        spadDetails.currentInvestment = await spadContract.methods.currentInvestment().call();
        spadDetails.minInvestment = await spadContract.methods.minInvestment().call();
        spadDetails.maxInvestment = await spadContract.methods.maxInvestment().call();
        spadDetails.spadInitiator = await spadContract.methods.spadInitiator().call();
        spadDetails.status = await spadContract.methods.status().call();
        spadDetails.isPrivate = await spadContract.methods.isPrivate().call();
        spadDetails.currencyAddress = await spadContract.methods.currencyAddress().call();
        if(spadDetails.currencyAddress == '0x0000000000000000000000000000000000000000') {
            spadDetails.currencyAddress = "";
        }
        spadDetails.targetView = Number(getFromDecimals(spadDetails.currencyAddress, spadDetails.target));
        spadDetails.minInvestmentView = Number(getFromDecimals(spadDetails.currencyAddress,spadDetails.minInvestment));
        spadDetails.maxInvestmentView = Number(getFromDecimals(spadDetails.currencyAddress,spadDetails.maxInvestment));
        spadDetails.currentInvestmentView = Number(getFromDecimals(spadDetails.currencyAddress,spadDetails.currentInvestment));
        
        spadDetails.currentInvstPercent = Math.round((spadDetails.currentInvestment / spadDetails.target) * 10000) / 100;
        spadDetails.investorCount = await spadActionsContract.methods.getInvestorCount(spadAddress).call();
        spadDetails.created = await spadContract.methods.created().call();
        
        spadDetails.investmentCurrency = getCurrencyName(spadDetails.currencyAddress);

        spadDetails.symbol = await spadContract.methods.symbol().call();
        spadDetails.totalSupply = await spadContract.methods.totalSupply().call();
        spadDetails.totalSupplyView = Number(getFromDecimals(spadDetails.currencyAddress,spadDetails.totalSupply));
        spadDetails.decimals = await spadContract.methods.decimals().call();

        if(spadDetails.status == 5) {
            spadDetails.acquiredBy = await spadActionsContract.methods.getAcquiredBy(spadAddress).call();
        }

        spadDetails.initiatorContribution = await this.getContribution(spadDetails.spadInitiator, spadDetails.currencyAddress, spadAddress);
        return spadDetails;
    }

    async getPortfolioSpadDetails(spadAddress, address) {
        const spadContract = this.getSpadContract(spadAddress);
        const spadDetails = {};
        spadDetails.name = await spadContract.methods.name().call(); 
        spadDetails.status = await spadContract.methods.status().call();
        spadDetails.spadInitiator = await spadContract.methods.spadInitiator().call();
        spadDetails.isPrivate = await spadContract.methods.isPrivate().call();
        spadDetails.currencyAddress = await spadContract.methods.currencyAddress().call();
        if(spadDetails.currencyAddress == '0x0000000000000000000000000000000000000000') {
            spadDetails.currencyAddress = "";
        }
        spadDetails.investmentCurrency = getCurrencyName(spadDetails.currencyAddress);

        spadDetails.symbol = await spadContract.methods.symbol().call();
        spadDetails.target = await spadContract.methods.target().call();
        spadDetails.targetView = Number(getFromDecimals(spadDetails.currencyAddress, spadDetails.target));

        if(spadDetails.status == 5) {
            spadDetails.acquiredBy = await spadActionsContract.methods.getAcquiredBy(spadAddress).call();
            try {
                spadDetails.isInvestmentClaimed = await spadActionsContract.methods.isInvestmentClaimed(spadAddress).call({from: address});
            } catch (error) {
                
            }
        }
        return spadDetails;
    }

    async getContribution(address, currencyAddress, spadAddress) {
        if (!window.ethereum || spadAddress === "" || address === "") {
            return 0;
        }
        const contribution = await spadActionsContract.methods.getContribution(spadAddress).call({from: address}); 
        return parseFloat(getFromDecimals(currencyAddress, contribution));
    }

    async activateSpad(address, spadAddress, amount, description, currencyAddress) {
        if (!window.ethereum || address === null || address === "") {
            return {
                status: "💡 Connect your Metamask wallet to activate SPAD.",
                code: 403
            };
        }
        let value = "0";
        
        if(currencyAddress === "") {
            value = getFromDecimals("", amount);
        }
        try {
            await spadActionsContract.methods.activate(spadAddress,  description).send({
                from: address,
                value: value
            });
            return {
                code: 200
            }
        } catch (error) {
            console.log(error)
            return {
                code: 403
            };
        }
    }

    async contribute(address, spadAddress, currencyAddress, amount, passKey) {
        let value = "0";
        if(currencyAddress === "") {
            value = getDecimals("", amount);    
        }
        try {
            await spadActionsContract.methods.contribute(spadAddress,  getDecimals(currencyAddress, amount), passKey).send({
                from: address,
                value: value
            });
            return {
                code: 200
            }
        } catch (error) {
            console.log(error)
            return {
                code: 403
            };
        }
    }

    async sendTransaction(address, contractAddress, data, value) {
        if (!window.ethereum || address === null || address === "") {
            return {
                status: "💡 Connect your Metamask wallet to create SPAD.",
                code: 403
            };
        }
      
        const transactionParameters = {
            to: contractAddress,
            from: address,
            data: data,
            value: value
        };
      
        try {
            const txHash = await window.ethereum.request({
                method: "eth_sendTransaction",
                params: [transactionParameters],
            });
      
            return {
                status: txHash,
                code: 200
            }
      
        } catch (error) {
            return {
                status: "😥 " + error.message,
                code: 403
            };
        }
    }

    async getPitch(address, spadAddress) {
        const pitch = await spadActionsContract.methods.getPitch(spadAddress).call({from: address});
        return pitch;
    }

    async getPitchers(spadAddress) {
        const pitchers = await spadActionsContract.methods.getPitchers(spadAddress).call();
        return pitchers;
    }

    async pitchForSPAD(address, spadAddress, name, description) {
        if (!window.ethereum || address === null || address === "") {
            return {
                status: "💡 Connect your Metamask wallet to pitch.",
                code: 403
            };
        }
        try {
            await spadActionsContract.methods.pitchSpad(spadAddress, name, description, "").send({
                from: address,
                value: 0
            });
            return {
                code: 200
            }
        } catch (error) {
            console.log(error)
            return {
                code: 403
            };
        }
    }

    getContributionEvents (spadAddress, callback) {
        // console.log(spadAddress);
        if (!window.ethereum || spadAddress === "") {
            return false;
        }
        spadActionsContract.getPastEvents('Contributed', {
            filter: {spadAddress: spadAddress},
            fromBlock: 0,
            toBlock: 'latest'
        }, callback)
        .then(function(events) {
            return Promise.resolve(events);
        });
    }

    async pitchApproval(address, spadAddress, pitcher, approval) {
        if (!window.ethereum || address === null || address === "") {
            return {
                status: "💡 Connect your Metamask wallet to process approval.",
                code: 403
            };
        }
        try {
            await spadActionsContract.methods.pitchReview(spadAddress, pitcher, approval).send({
                from: address,
                value: 0
            });
            return {
                code: 200
            }
        } catch (error) {
            return {
                code: 403
            };
        }
    }

    async claimInvestment(address, spadAddress) {
        if (!window.ethereum || address === null || address === "") {
            return {
                status: "💡 Connect your Metamask wallet to claim tokens.",
                code: 403
            };
        }
        try {
            await spadActionsContract.methods.claimInvestment(spadAddress).send({
                from: address,
                value: 0
            });
            return {
                code: 200
            }
        } catch (error) {
            return {
                code: 403
            };
        }
    }

    isInvestmentClaimed = async(address, spadAddress) => {
        try {
            const isClamied = await spadActionsContract.methods.isInvestmentClaimed(spadAddress).call({from: address});
            return isClamied;
        } catch (error) {
            return false;
        }
    }

    getInitiatedSpads = async(address) => {
        const spadAddresses = await spadActionsContract.methods.getInitiatedSpads().call({from: address});
        return spadAddresses;
    }

    getInvestedSpads = async(address) => {
        const spadAddresses = await spadActionsContract.methods.getInvestedSpads().call({from: address});
        return spadAddresses;
    }

    getInvestedSpads = async(address) => {
        const spadAddresses = await spadActionsContract.methods.getInvestedSpads().call({from: address});
        return spadAddresses;
    }

    getTwitterHandle = async(address) => {
        if (!window.ethereum || address === "") {
            return "";
        }
        const handle = await spadFactoryContract.methods.getTwitterHandle(address).call(); 
        return handle;
    }

    async setTwitterHandle(address, handle) {
        if (!window.ethereum || address === null || address === "") {
            return {
                status: "💡 Connect your Metamask wallet to process approval.",
                code: 403
            };
        }
        const value = 0;
        const data = spadFactoryContract.methods.setTwitterHandle(address, handle).encodeABI();
        const response = await this.sendTransaction(address, factoryContractAddress, data, value);
        return response;
    }

}

export default new SpadService();
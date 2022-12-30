import web3 from "../web3";
import { getDecimals } from "./tokens.service";

const contractFactoryABI = require("../../abis/factory-abi.json");
export const factoryContractAddress = "0x35FaC56F5A2A53bEdC56c078fD5E24b269F7f073";
export const factoryContract = new web3.eth.Contract(
    contractFactoryABI, factoryContractAddress
);

class FactoryService {
    async startSpad(address, name, symbol, target, minInvestment, maxInvestment, currency) {
        if (!window.ethereum || address === null || address === "") {
            return {
                status: "💡 Connect your Metamask wallet to Start a SPAD.",
                code: 403
            };
        }
        let value = "0";
        const currencyAddress = (currency == "") ? '0x0000000000000000000000000000000000000000' : currency;
        
        try {
            const response = await factoryContract.methods.createSpad(name, symbol, getDecimals(currency, target), getDecimals(currency, minInvestment), getDecimals(currency, maxInvestment), currencyAddress).send({
                from: address,
                value: value
            });
            console.log(response);
            return {
                code: 200,
                data: response
            }
        } catch (error) {
            console.log(error)
            return {
                code: 403
            };
        }
    }

    async getAllSpads() {
        const spadAddresses = [];
        const spads = await factoryContract.getPastEvents('SpadCreated', {
            filter: {},
            fromBlock: 0,
            toBlock: 'latest'
        });
        spads.forEach((event) => {
            spadAddresses.push(event.returnValues.spadAddress);
        })
        return spadAddresses.reverse();
    }

    async getCreatedSpads(address) {
        const spadAddresses = [];
        const spads = await factoryContract.getPastEvents('SpadCreated', {
            filter: { initiator: address },
            fromBlock: 0,
            toBlock: 'latest'
        });
        spads.forEach((event) => {
            spadAddresses.push(event.returnValues.spadAddress);
        })
        return spadAddresses.reverse();
    }
}

export default new FactoryService();
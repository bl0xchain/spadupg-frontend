import web3 from "../web3";

const contractFundABI = require("../../abis/fund-abi.json");
export const fundContractAddress = "0xb1Daa2132F827Cd661Adf4074D3fF30e76eC6834";
export const fundContract = new web3.eth.Contract(
    contractFundABI, fundContractAddress
);

class FundService {
    async getContribution(address, spadAddress) {
        const contribution = await fundContract.methods.getContribution(spadAddress, address).call();
        return contribution;
    } 

    async getFundData(spadAddress) {
        const data = await fundContract.methods.getFundData(spadAddress).call();
        return data;
    } 

    async isInvestmentClaimed(address, spadAddress) {
        const isClaimed = await fundContract.methods.isInvestmentClaimed(spadAddress, address).call();
        return isClaimed;
    }
}

export default new FundService();
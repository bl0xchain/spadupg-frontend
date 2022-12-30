import web3 from "../web3";
import fundService from "./fund.service";
import pitchService from "./pitch.service";
import { getCurrencyName, getFromDecimals } from "./tokens.service";
const contractSpadABI = require("../../abis/spads-abi.json");


class SpadService {
    getSpadContract(spadAddress) {
        return new web3.eth.Contract(
            contractSpadABI,
            spadAddress
        );
    }

    async getSpadDetails(spadAddress, addPitch=false) {
        const spadContract = this.getSpadContract(spadAddress);
        const spadDetails = {};

        spadDetails.name = await spadContract.methods.name().call(); 
        spadDetails.symbol = await spadContract.methods.symbol().call(); 
        spadDetails.target = await spadContract.methods.target().call();
        spadDetails.minInvestment = await spadContract.methods.minInvestment().call();
        spadDetails.maxInvestment = await spadContract.methods.maxInvestment().call();
        spadDetails.creator = await spadContract.methods.creator().call();
        spadDetails.status = await spadContract.methods.status().call();
        spadDetails.currencyAddress = await spadContract.methods.currencyAddress().call();
        if(spadDetails.currencyAddress == '0x0000000000000000000000000000000000000000') {
            spadDetails.currencyAddress = "";
        }
        spadDetails.created = await spadContract.methods.created().call();
        spadDetails.targetView = Number(getFromDecimals(spadDetails.currencyAddress, spadDetails.target));
        spadDetails.minInvestmentView = Number(getFromDecimals(spadDetails.currencyAddress,spadDetails.minInvestment));
        spadDetails.maxInvestmentView = Number(getFromDecimals(spadDetails.currencyAddress,spadDetails.maxInvestment));
        spadDetails.investmentCurrency = getCurrencyName(spadDetails.currencyAddress);

        spadDetails.creatorContribution = await fundService.getContribution(spadDetails.creator, spadAddress);
        spadDetails.creatorContributionView = Number(getFromDecimals(spadDetails.currencyAddress, spadDetails.creatorContribution));
        const fund = await fundService.getFundData(spadAddress);
        spadDetails.currentInvestment = fund.currentInvestment;
        spadDetails.currentInvestmentView = Number(getFromDecimals(spadDetails.currencyAddress,spadDetails.currentInvestment));
        spadDetails.investorCount = fund.investorCount;

        spadDetails.currentInvstPercent = Math.round((spadDetails.currentInvestmentView / spadDetails.targetView) * 10000) / 100;
        
        if(spadDetails.status == 5) {
            spadDetails.acquiredBy = await pitchService.getAcquiredBy(spadAddress);
            if(addPitch) {
                spadDetails.pitch = await pitchService.getPitch(spadDetails.acquiredBy, spadAddress);
            }
        }

        return spadDetails;
    }
}

export default new SpadService();
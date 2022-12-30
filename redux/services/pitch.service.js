import web3 from "../web3";
import { getCurrencyContract, getFromDecimals } from "./tokens.service";

const contractPitchABI = require("../../abis/pitch-abi.json");
export const pitchContractAddress = "0x071555BdD27A365F0b0697CFA35a78357F67A87B";
export const pitchContract = new web3.eth.Contract(
    contractPitchABI, pitchContractAddress
);

class PitchService {
    async getPitch(address, spadAddress) {
        const pitch = await pitchContract.methods.getPitch(spadAddress, address).call();
        if(pitch.status != 0) {
            if(pitch.tokenAddress != "0x0000000000000000000000000000000000000000") {
                const tokenContract = getCurrencyContract(pitch.tokenAddress);
                pitch.tokenName = await tokenContract.methods.name().call();
                pitch.tokenSymbol = await tokenContract.methods.symbol().call();
                pitch.tokenDecimals = await tokenContract.methods.decimals().call();
            } else {
                pitch.tokenName = "";
                pitch.tokenSymbol = "";
                pitch.tokenDecimals = 18;
            }
            // const tokenContract = getCurrencyContract(pitch.tokenAddress);
            // pitch.tokenName = await tokenContract.methods.name().call();
            // pitch.tokenSymbol = await tokenContract.methods.symbol().call();
            // pitch.tokenDecimals = await tokenContract.methods.decimals().call();
            if(pitch.tokenDecimals == 18) {
                pitch.amount = getFromDecimals("", pitch.tokenAmount);
            } else {
                pitch.amount = getFromDecimals("USDC", pitch.tokenAmount);
            }
        }
        return pitch;
    } 

    async getAcquiredBy(spadAddress) {
        const acquiredBy = await pitchContract.methods.getAcquiredBy(spadAddress).call();
        return acquiredBy;
    } 

    async getPitchers(spadAddress) {

    }
}

export default new PitchService();
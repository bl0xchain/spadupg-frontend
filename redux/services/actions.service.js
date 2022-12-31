import web3 from "../web3";
import { getDecimals } from "./tokens.service";

const contractActionsABI = require("../../abis/actions-abi.json");
export const actionsContractAddress = "0x6e6268c2F3b9FAd851A94602c2c100b64B6901d1";
export const actionsContract = new web3.eth.Contract(
    contractActionsABI, actionsContractAddress
);

class ActionsService {
    async activateSpad(address, spadAddress, amount, currencyAddress) {
        if (!window.ethereum || address === null || address === "") {
            return {
                status: "💡 Connect your Metamask wallet to Activate a SPAD.",
                code: 403
            };
        }
        let value = "0";
        if(currencyAddress === "") {
            value = amount.toString();
        }
        
        try {
            const response = await actionsContract.methods.activateSpad(spadAddress).send({
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

    async contribute(address, spadAddress, amount, currencyAddress) {
        let value = "0";
        if(currencyAddress === "") {
            value = getDecimals("", amount);    
        }
        try {
            await actionsContract.methods.contribute(spadAddress,  getDecimals(currencyAddress, amount)).send({
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

    async pitchSpad(address, spadAddress, name, description, tokenAddress, tokenAmount) {
        let value = "0";
        if(tokenAddress === "") {
            tokenAddress = '0x0000000000000000000000000000000000000000';
        }
        try {
            await actionsContract.methods.pitchSpad(spadAddress, name, description, tokenAddress, tokenAmount).send({
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

    getContributionEvents (spadAddress, callback) {
        if (!window.ethereum || spadAddress === "") {
            return false;
        }
        actionsContract.getPastEvents('Contributed', {
            filter: {spadAddress: spadAddress},
            fromBlock: 0,
            toBlock: 'latest'
        }, callback)
        .then(function(events) {
            return Promise.resolve(events);
        });
    }

    async getPitchers(spadAddress) {
        const pitchers = [];
        const pitches = await actionsContract.getPastEvents('PitchProposed', {
            filter: { spadAddress: spadAddress },
            fromBlock: 0,
            toBlock: 'latest'
        });
        pitches.forEach((event) => {
            pitchers.push(event.returnValues.pitcher);
        });
        return pitchers;
    }

    async pitchReview(address, spadAddress, pitcher, approval) {
        try {
            await actionsContract.methods.pitchReview(spadAddress, pitcher, approval).send({
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

    async claimTokens(address, spadAddress) {
        try {
            await actionsContract.methods.claimTokens(spadAddress).send({
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

    async getClaimedTokens(address, spadAddress) {
        const claims = await actionsContract.getPastEvents('InvestmentClaimed', {
            filter: { spadAddress: spadAddress, contributor: address },
            fromBlock: 0,
            toBlock: 'latest'
        });
        if(claims.length > 0) {
            return claims[0].returnValues.amount;
        } else {
            return 0;
        }
    }

    async getContributedSpads(address) {
        const spadAddresses = [];
        const spads = await actionsContract.getPastEvents('Contributed', {
            filter: { contributor: address },
            fromBlock: 0,
            toBlock: 'latest'
        });
        spads.forEach((event) => {
            if(spadAddresses.indexOf(event.returnValues.spadAddress) == -1) {
                spadAddresses.push(event.returnValues.spadAddress);
            }
        })
        return spadAddresses.reverse();
    }

    async getPitchedSpads(address) {
        const spadAddresses = [];
        const spads = await actionsContract.getPastEvents('PitchProposed', {
            filter: { pitcher: address },
            fromBlock: 0,
            toBlock: 'latest'
        });
        spads.forEach((event) => {
            spadAddresses.push(event.returnValues.spadAddress);
        })
        return spadAddresses.reverse();
    }
}

export default new ActionsService();
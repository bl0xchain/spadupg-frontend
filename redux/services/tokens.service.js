import web3 from "../web3";
import { actionContractAddress } from "./spad.service";
const contractERC20ABI = require("../../abis/erc20-abi.json");

export const usdcContractAddress = "0x98339D8C260052B7ad81c28c16C0b98420f2B46a";
export const daiContractAddress = "0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844";

export const currencies = {
    "": {
        "name": "ETH",
        "decimals": 18
    },
    "0x98339D8C260052B7ad81c28c16C0b98420f2B46a": {
        "name": "USDC",
        "decimals": 6
    },
    "0x11fE4B6AE13d2a6055C8D9cF65c55bac32B5d844": {
        "name": "DAI",
        "decimals": 18
    }
}

export const getCurrencyContract = (currencyAddress) => {
    return new web3.eth.Contract(
        contractERC20ABI, currencyAddress
    );
}

export const getDecimals = (currencyAddress, amount) => {
    const decimals = currencies[currencyAddress].decimals;
    if(decimals === 6) {
        return web3.utils.toWei(amount, 'mwei');
    
    } else {
        return web3.utils.toWei(amount, 'ether');
    }
}

export const getFromDecimals = (currencyAddress, amount) => {
    const decimals = currencies[currencyAddress].decimals;
    if(decimals === 6) {
        return web3.utils.fromWei(amount, 'mwei');
    } else {
        return web3.utils.fromWei(amount, 'ether');
    }
}

export const getCurrencyName = (currencyAddress) => {
    return currencies[currencyAddress].name;
}

class TokensService {
    
    async getCurrencyAllowance(address, currencyAddress) {
        const contract = getCurrencyContract(currencyAddress);
        const allowance = await contract.methods.allowance(address, actionContractAddress).call({
            from: address
        });
        return getFromDecimals(currencyAddress, allowance);
    }

    async allowCurrency (address, currencyAddress, amount)  {
        const contract = getCurrencyContract(currencyAddress);

        try {
            await contract.methods.approve(actionContractAddress, getDecimals(currencyAddress, amount.toString())).send({
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

    // async allowCurrency (address, currencyAddress, amount)  {
    //     if (!window.ethereum || address === null || address === "") {
    //         return {
    //             status: "💡 Connect your Metamask wallet to approve tokens.",
    //             code: 403
    //         };
    //     }

    //     const contract = getCurrencyContract(currencyAddress);

    //     const transactionParameters = {
    //         to: currencyAddress,
    //         from: address,
    //         data: contract.methods.approve(actionContractAddress, getDecimals(currencyAddress, amount.toString())).encodeABI()
    //     };

    //     try {
    //         const txHash = await window.ethereum.request({
    //             method: "eth_sendTransaction",
    //             params: [transactionParameters],
    //         });

    //         return {
    //             status: txHash,
    //             code: 200
    //         }

    //     } catch (error) {
    //         return {
    //             status: "😥 " + error.message,
    //             code: 403
    //         };
    //     }
    // }

    async getTokenBalance(address, tokenAddress, currencyAddress) {
        const contract = getCurrencyContract(tokenAddress);
        const balance = await contract.methods.balanceOf(address).call({
            from: address
        });
        return getFromDecimals(currencyAddress, balance);
    }

    async getEthBalance(address) {
        const balance = await web3.eth.getBalance(address);
        return getFromDecimals("", balance);
    }

    async getTokenData(tokenAddress) {
        const tokenContract = getCurrencyContract(tokenAddress);
        const name = await tokenContract.methods.name().call();
        const symbol = await tokenContract.methods.symbol().call();
        const decimals = await tokenContract.methods.decimals().call();

        return {
            address: tokenAddress,
            name: name,
            symbol: symbol,
            decimals: decimals
        }
    }
}

export default new TokensService();
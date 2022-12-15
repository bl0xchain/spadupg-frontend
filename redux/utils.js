export const getShortAddress = (address) => {
    return String(address).substring(0, 6) + "..." + String(address).substring(38)
}

export const sendTransaction = async(address, contractAddress, data, value) => {
    if (!window.ethereum || address === null || address === "") {
        return {
            status: "💡 Connect your Metamask wallet",
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
        console.log(error.message)
        return {
            status: "😥 " + error.message,
            code: 403
        };
    }
}
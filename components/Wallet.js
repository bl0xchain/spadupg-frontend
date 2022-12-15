import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connectWallet, loadWallet } from "../redux/slices/walletSlice";
import { FaExternalLinkAlt, FaLink, FaUnlink } from "react-icons/fa"
import { useRouter } from "next/router";
import { Badge, Button, Dropdown, DropdownButton, OverlayTrigger, Spinner, Tooltip } from "react-bootstrap";
import tokensService, { daiContractAddress, usdcContractAddress } from "../redux/services/tokens.service";
import { getShortAddress } from "../redux/utils";

const Wallet = () => {
    const [ethBalance, setEthBalance] = useState("");
    const [usdcBalance, setUsdcBalance] = useState("");
    const [daiBalance, setDaiBalance] = useState("");

    const dispatch = useDispatch()
    const address = useSelector((state) => state.wallet.address)
    const status = useSelector((state) => state.wallet.status)
    const router = useRouter()

    const handleConnect = () => {
        dispatch(connectWallet())
    }

    const addWalletListener = useCallback( () => {
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", (accounts) => {
                dispatch(loadWallet())
            });
            window.ethereum.on("chainChanged", (chainid) => {
                dispatch(loadWallet())
            });
        }
    }, [dispatch]);

    useEffect( () => {
        async function loadBalance() {
            const eth = await tokensService.getEthBalance(address);
            setEthBalance(eth);
            const usdc = await tokensService.getTokenBalance(address, usdcContractAddress, usdcContractAddress);
            setUsdcBalance(usdc);
            const dai = await tokensService.getTokenBalance(address, daiContractAddress, daiContractAddress);
            setDaiBalance(dai);
        }
        if(address && address !== '') {
            loadBalance();
        }
    }, [address])

    useEffect(() => {
        dispatch(loadWallet())
        addWalletListener()
    }, [])

    return (
        <>
        {
            address === "" ?
            <>
            {
                status == 'PENDING' ?
                <Button variant="color" disabled>Connecting Wallet <Spinner animation="border" size="sm" /></Button> :
                <Button variant="color" onClick={handleConnect}>
                    <span className="hidden md:inline-block">CONNECT WALLET</span>
                </Button>
            }
            </>
             : 
            <>
            {
                status === 'CONNECTED' ?
                <DropdownButton variant="color" id="dropdown-item-button" align="end"
                        title={"Connected: "+getShortAddress(address)}
                    >
                        <Dropdown.Item href={"https://goerli.etherscan.io/address/"+address} target="_blank" className="fw-bold">
                            {getShortAddress(address)} {" "} <FaExternalLinkAlt />
                        </Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.ItemText>
                            <p>ETH : {Number(ethBalance).toFixed(4)}</p>
                            <p>USDC : {Number(usdcBalance).toFixed(4)}</p>
                            <p className="mb-0">DAI : {Number(daiBalance).toFixed(4)}</p>
                        </Dropdown.ItemText>
                    </DropdownButton> :
                <OverlayTrigger
                    placement="bottom"
                    overlay={<Tooltip>Connect to Goerli Testnet</Tooltip>}
                >
                    <Badge pill bg="danger" text="light">
                        <FaUnlink /> { " " }
                        Wrong Network
                    </Badge>
                </OverlayTrigger>
            }
            
            </>
        }
        </>
    )
}

export default Wallet;
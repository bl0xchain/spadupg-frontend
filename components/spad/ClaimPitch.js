import { useEffect, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import actionsService, { actionsContractAddress } from "../../redux/services/actions.service";
import tokensService, { getCurrencyContract } from "../../redux/services/tokens.service";
import { showConnectionPopUp } from "../../redux/slices/walletSlice";

const ClaimPitch = ({ spadAddress, pitch, loadPitch }) => {
    const [allowance, setAllowance] = useState(null);
    const [balance, setBalance] = useState(null);
    const [approving, setApproving] = useState(false);
    const [claiming, setClaiming] = useState(false);

    const dispatch = useDispatch()
    const address = useSelector((state) => state.wallet.address);
    const connectionStatus = useSelector((state) => state.wallet.status);

    const checkAllowance = async() => {
        const tokenContract = getCurrencyContract(pitch.tokenAddress);
        const bal = await tokenContract.methods.balanceOf(address).call();
        setBalance(parseInt(bal));
        const allow = await tokenContract.methods.allowance(address, actionsContractAddress).call();
        setAllowance(parseInt(allow));
    }

    const handleApprove = async() => {
        if(connectionStatus !== 'CONNECTED') {
            dispatch(showConnectionPopUp())
            return;
        }
        setApproving(true);
        const response = await tokensService.approveTokens(address, pitch.tokenAddress, pitch.tokenAmount);
        if(response.code == 200) {
            toast.success("Tokens Approval completed");
            const tokenContract = getCurrencyContract(pitch.tokenAddress);
            const allow = await tokenContract.methods.allowance(address, actionsContractAddress).call();
            setAllowance(parseInt(allow));
        } else {
            toast.error("Tokens Approval failed")
        }
        setApproving(false);
    }

    const handleClaim = async() => {
        if(connectionStatus !== 'CONNECTED') {
            dispatch(showConnectionPopUp())
            return;
        }
        setClaiming(true);
        const response = await actionsService.claimPitch(address, spadAddress);
        if(response.code == 200) {
            toast.success("Pitch claim successful");
            await loadPitch();
        } else {
            toast.error("Pitch claim failed")
        }
        setClaiming(false);
    }

    useEffect(() => {
        if(pitch && pitch.status == 4) {
            checkAllowance();
        }
    }, [pitch]);

    return (
        <>
        {
            ( pitch && balance != null && allowance != null && pitch.status == 4 ) &&
            <>
            {
                (balance >= parseInt(pitch.tokenAmount)) ?
                <>
                {
                    (allowance >= parseInt(pitch.tokenAmount)) ?
                    <>
                    {
                        claiming ?
                        <Button variant="color" size="sm" disabled>
                            Claiming Pitch {' '} <Spinner animation="border" size="sm" />
                        </Button> :
                        <Button variant="color" onClick={handleClaim}>Claim Pitch</Button>
                    }   
                    </>
                     :
                    <>
                        <p className="text-warning">You need to approve {" "} {pitch.amount} {" "} {pitch.tokenSymbol} to claim this Pitch</p>
                        {
                            approving ?
                            <Button variant="color" size="sm" disabled>
                                Approving {" "} {pitch.amount} {" "} {pitch.tokenSymbol} {' '} <Spinner animation="border" size="sm" />
                            </Button> :
                            <Button variant="color" onClick={handleApprove}>
                                Approve {" "} {pitch.amount} {" "} {pitch.tokenSymbol}
                            </Button>
                        }
                    </>
                }
                </> :
                <p className="text-danger">You need {" "} {pitch.amount} {" "} {pitch.tokenSymbol} to claim this Pitch</p>
            }
            
            </>
        }
        </>
    )
}

export default ClaimPitch;
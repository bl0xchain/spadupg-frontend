import { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import pitchService from "../../redux/services/pitch.service";
import spadsService from "../../redux/services/spads.service";
import EtherScanAddress from "../EtherScanAddress";

const CreatorPitch = ({ spadAddress, creator }) => {
    const [pitch, setPitch] = useState(null);

    const fetchPitch = async () => {
        const pitchData = await pitchService.getPitch(creator, spadAddress);
        
        if(pitchData.tokenName == "") {
            const spadContract = spadsService.getSpadContract(spadAddress);
            pitchData.tokenName = await spadContract.methods.name().call(); 
            pitchData.tokenSymbol = await spadContract.methods.symbol().call();
            pitchData.tokenAddress = "";
        }
        setPitch(pitchData);
    }

    useEffect(() => {
        if(creator) {
            fetchPitch();
        }
    }, [creator]);

    return (
        <>
        {
            pitch != null &&
            <Card className="rounded color p-4 mb-4 shadow compact">
                <h5 className="mb-0">{pitch.name}</h5>
                <small className="text-muted">{creator}</small>
                <p className="mt-3">{pitch.description}</p>
                <div>
                    <p className="mb-0">
                        <b>Token:</b> {pitch.amount} {pitch.tokenSymbol} {"  "} 
                        (
                            {
                                pitch.tokenAddress == "" ?
                                <>{pitch.tokenName}</> :
                                <EtherScanAddress address={pitch.tokenAddress} showIcon={true} text={pitch.tokenName} />
                            }
                        )
                    </p>
                </div>
            </Card>
        

        }
        </>
    )
}

export default CreatorPitch;
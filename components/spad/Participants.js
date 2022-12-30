import Decimal from "decimal.js-light";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import actionsService from "../../redux/services/actions.service";
import spadService from "../../redux/services/spad.service";
import { getFromDecimals } from "../../redux/services/tokens.service";
import { getShortAddress } from "../../redux/utils";
import Share from "./Share";

const Participants = ({ spadAddress, spad }) => {

    const [participants, setParticipants] = useState(null);

    const loadParticipants = () => {
        console.log(spad);
        if(spadAddress) {
            actionsService.getContributionEvents(spadAddress, (error, events) => {
                console.log(events);
                if(!error) {
                    let participants = [];
                    participants.push({
                        address: spad.creator,
                        amount: Decimal(spad.targetView).dividedBy(10).toString(),
                        // tokens: Decimal(spad.totalSupplyView).dividedBy(10).toString()
                    });
                    events.forEach(event => {
                        let amount = Number(getFromDecimals(spad.currencyAddress, event.returnValues.amount));
                        participants.push({
                            address: event.returnValues.contributor,
                            amount: amount,
                            // tokens: Decimal(spad.totalSupplyView).times(amount).dividedBy(spad.targetView).toString()
                        });    
                    });
                    setParticipants(participants)
                } else {
                    setParticipants(false)
                }
            });
        }
    }

    useEffect(() => {
        if(spad) {
            loadParticipants();
        }
    }, [spad])

    return (
        <div className='fw-bold compact'>
            <h2 className="fw-bold mb-4">PARTICIPANTS</h2>
            {
                (participants && spad.creatorContribution > 0) ? 
                <Table borderless className='align-middle mb-4'>
                    <thead>
                        <tr className="text-secondary1">
                            <th>#</th>
                            <th>ADDRESS</th>
                            {/* <th>TOKENS ALLOCATED</th> */}
                            <th>AMOUNT</th>
                        </tr>
                    </thead>
                    <tbody>
                    { participants.map(function(event, i) {
                        return <tr key={i}>
                            <td style={{position: "relative"}}>
                                <Image src='/spad-link-icon.png' alt="|" width={24} height={44} />
                            </td>
                            <td>{ getShortAddress(event.address) }</td>
                            {/* <td> {event.tokens} </td> */}
                            <td>
                                {event.amount} {" "}
                                {spad.investmentCurrency}
                            </td>
                            
                        </tr>
                    }) }
                    </tbody>
                </Table> :
                <>
                    <p className="">No Participants</p>
                    
                    <Share showTitle={true} />
                </>
                
            }
                                    
        </div>
    )
}

export default Participants;
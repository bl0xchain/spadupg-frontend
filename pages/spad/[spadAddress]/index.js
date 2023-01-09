import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Card, Col, Placeholder, Row, Spinner } from "react-bootstrap";
import Confetti from "react-confetti";
import Moment from "react-moment";
import EtherScanAddress from "../../../components/EtherScanAddress";
import CompletedSpad from "../../../components/spad/CompletedSpad";
import CreatorPitch from "../../../components/spad/CreatorPitch";
import Participants from "../../../components/spad/Participants";
import SpadCardPlaceholder from "../../../components/spad/SpadCardPlaceholder";
import SpadDetailsCard from "../../../components/spad/SpadDetailsCard";
import pitchService from "../../../redux/services/pitch.service";
import spadsService from "../../../redux/services/spads.service";
// import spadService from "../../../redux/services/spad.service";

const Spad = () => {
    const router = useRouter()
    const { spadAddress, isNew } = router.query

    const [spad, setSpad] = useState(null);
    const [pitch, setPitch] = useState(null)

    const loadSpad = async() => {
        const spadDetails = await spadsService.getSpadDetails(spadAddress, true);
        setSpad(spadDetails);
        // if(spadDetails.isPrivate) {
        //     pitchService.getPitch(spadDetails.spadInitiator, spadAddress).then((pitch) => {
        //         setPitch(pitch);
        //     });
        // }
    }

    useEffect(() => {
        if(spadAddress !== undefined) {
            loadSpad()
        }
    }, [spadAddress])

    return (
        <div className="main-content" id="spad-page">
        {
            spad !== null ?
            <div>
                {
                    isNew &&
                    <Confetti
                        width={window.innerWidth- 20}
                        height={window.innerHeight}
                        recycle={false}
                        numberOfPieces={800}
                    />
                }
                
                <SpadDetailsCard spadAddress={spadAddress} spad={spad} loadSpad={loadSpad} />
                {
                    (spad.status == 4) &&
                    <CompletedSpad spadAddress={spadAddress} spad={spad} />
                }
                {/* <Card className="rounded color fw-bold p-4 mb-4 shadow compact">
                    <h2 className="fw-bold mb-4">SPAD DETAILS</h2>
                    <Row>
                        <Col sm="6">
                            <Row className='mb-4'>
                                <Col xs="6" className="text-secondary1">TOKEN NAME</Col>
                                <Col xs="6">{spad.symbol}</Col>
                            </Row>
                            <Row className='mb-4'>
                                <Col xs="6" className="text-secondary1">TOKEN ADDRESS</Col>
                                <Col xs="6">
                                    <EtherScanAddress address={spadAddress} showIcon={true} />
                                </Col>
                            </Row>
                            <Row className='mb-4'>
                                <Col xs="6" className="text-secondary1">TOKEN SUPPLY</Col>
                                <Col xs="6">{spad.totalSupplyView}</Col>
                            </Row>
                            <Row className='mb-4'>
                                <Col xs="6" className="text-secondary1">DECIMALS</Col>
                                <Col xs="6">{spad.decimals}</Col>
                            </Row>
                        </Col>
                        <Col sm="6">
                            <Row className='mb-4'>
                                <Col xs="6" className="text-secondary1">SPAD START DATE</Col>
                                <Col xs="6"><Moment unix format="DD MMM YYYY">{spad.created}</Moment></Col>
                            </Row>
                            <Row className='mb-4'>
                                <Col xs="6" className="text-secondary1">SPAD SIZE</Col>
                                <Col xs="6">{spad.targetView}{" "}{spad.investmentCurrency}</Col>
                            </Row>
                            {
                                spad.isPrivate &&
                                <Row className='mb-4'>
                                    <Col xs="12" className="text-secondary1">SPAD CREATOR PITCH</Col>
                                    <Col xs="12">{pitch.description}</Col>
                                </Row>
                            }      
                        </Col>
                    </Row>
                </Card> */}
                {
                    spad.isPrivate &&
                    <CreatorPitch spadAddress={spadAddress} creator={spad.creator} />
                }
                <hr className='mb-4' />
                <Participants spadAddress={spadAddress} spad={spad} />
            </div> :
            <SpadCardPlaceholder compact={true} />
        }
        </div>
    )
}

export default Spad;
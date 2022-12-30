import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, Col, ProgressBar, Row } from "react-bootstrap";
import spadService from "../../redux/services/spad.service";
import SpadCardPlaceholder from "./SpadCardPlaceholder";
import Decimal from "decimal.js-light";
import SpadActions from "./SpadActions";
import spadsService from "../../redux/services/spads.service";

const SpadCard = ({ spadAddress }) => {
    const [spad, setSpad] = useState(null)
    const [creatorContriPct, setCreatorContriPct] = useState(10)

    const spadStatus = {
        1: 'pending',
        2: 'open',
        3: 'expired',
        4: 'closed',
        5: 'acquired'
    }

    const loadSpad = async() => {
        // const spadDetails = await spadService.getSpadDetails(spadAddress);
        const spadDetails = await spadsService.getSpadDetails(spadAddress, true);
        setSpad(spadDetails);
        if(spadDetails.creatorContribution > 0) {
            setCreatorContriPct((Math.round((spadDetails.creatorContributionView / spadDetails.targetView) * 10000) / 100));
        }
    }

    useEffect(() => {
        loadSpad()
    }, [])

    return (
        <>
        {
            spad == null ?
            <SpadCardPlaceholder /> :
            <Card className="rounded spad-card p-0 shadow-lg">
                <div className={"spad-status "+spadStatus[spad.status]}>{spadStatus[spad.status]}</div>
                <Card.Body>
                    <div className="spad-name">
                        <Link href={"/spad/"+spadAddress} className="text-color fw-bold fs-4">{spad.name}</Link><br />
                        { spad.twitterHandle && <small><a href={"https://twitter.com/"+spad.twitterHandle} target="_blank" rel="noreferrer" className="text-muted">@{spad.twitterHandle}</a></small> }
                    </div>
                    <div className="spad-symbol">{spad.symbol}</div>
                    <div className="mb-4 mt-4">
                        
                            {
                                (spad.creatorContribution > 0) ?
                                <ProgressBar>
                                    <ProgressBar now={creatorContriPct} key={1} variant="success1" title="SPAD Creator Contribution" />
                                    <ProgressBar now={(Number(spad.currentInvstPercent) - Number(creatorContriPct))} key={2} variant="color" />
                                </ProgressBar> : 
                                <ProgressBar>
                                    <ProgressBar now={creatorContriPct} key={1} variant="secondary1" />
                                </ProgressBar>
                            }
                        
                        <Row>
                            <Col xs="6">
                                <small>
                                    <b>{spad.currentInvstPercent}%</b> Contribution done
                                </small>
                            </Col>
                            <Col xs="6">
                                <small className="text-end">
                                Remaining: <b>{Decimal(spad.targetView).minus(spad.currentInvestmentView).toString()} {spad.investmentCurrency}</b>
                                </small>
                            </Col>
                        </Row>
                    </div>
                    <Row className="pb-4 pt-4 ">
                        <Col className="text-center" md="auto">
                            <div className="spad-label">TOTAL HOLDERS</div>
                            <div className="spad-holder-text">{spad.investorCount}</div>
                        </Col>
                        <Col className="text-center">
                            <div className="spad-label">CONTRIBUTION RANGE</div>
                            <Row>
                                <Col>
                                    <div className="spad-range-text">{spad.minInvestmentView} {" "} {spad.investmentCurrency}</div>
                                    <div className="spad-range-label">Minimum</div>
                                </Col>
                                <Col>
                                    <div className="spad-range-text">{spad.maxInvestmentView} {" "} {spad.investmentCurrency}</div>
                                    <div className="spad-range-label">Maximum</div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <SpadActions spadAddress={spadAddress} spad={spad} loadSpad={loadSpad} />
                </Card.Body>
            </Card>
        }
        </>
    )
}

export default SpadCard;
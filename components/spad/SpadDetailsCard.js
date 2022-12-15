import { useEffect, useState } from "react";
import { Card, Col, ProgressBar, Row } from "react-bootstrap";
import { FaDotCircle, FaMinus, FaShieldAlt, FaUser } from "react-icons/fa";
import Moment from "react-moment";
import styles from "../../styles/Spad.module.css";
import EtherScanAddress from "../EtherScanAddress";
import Share from "./Share";
import SpadActions from "./SpadActions";

const SpadDetailsCard = ({ spadAddress, spad, loadSpad }) => {
    const [initiatorContriPct, setInitiatorContriPct] = useState(10)
    const spadStatus = {
        1: 'pending',
        2: 'open',
        3: 'expired',
        4: 'closed',
        5: 'acquired'
    }

    const getInitiatorContriPct = async() => {
        if(spad.initiatorContribution > 0) {
            setInitiatorContriPct((Math.round((spad.initiatorContribution / spad.targetView) * 10000) / 100));
        }
    }

    useEffect(() => {
        getInitiatorContriPct()
    }, [])

    return (
        <Card className="rounded color p-4 mb-4 shadow compact">
            <div className={styles.SpadBanner}>
                <div className={styles.SpadShare}><Share /></div>
                <Row>
                    <Col md="auto">
                        <p className="fw-bold text-light">TOKEN SYMBOL</p>
                        <div className={styles.SpadSymbol}>{spad.symbol}</div>
                    </Col>
                    <Col className="text-end">
                        <p className={styles.SpadName}>SPAD NAME</p>
                        <h2 className="fw-bold text-light">{spad.name}</h2>
                    </Col>
                </Row>
            </div>
            <ul className='mt-3 fw-bold list-inline text-end spad-feature-list'>
                <li className="list-inline-item">
                    <Moment unix format="DD MMM YYYY">{spad.created}</Moment>
                </li>
                <li className="list-inline-item">
                    <FaUser /> {" "}
                    <EtherScanAddress address={spad.spadInitiator} showIcon={true} />
                </li>
                <li className="list-inline-item">
                    <FaShieldAlt /> {" "}
                    { spad.isPrivate ? "Private" : "Public" }
                </li>
                <li className="list-inline-item text-capitalize">
                    <FaDotCircle className={spadStatus[spad.status]} />  {" "}
                    { spadStatus[spad.status] }
                </li>
                
            </ul>
            <Row className="mt-4 mb-4 align-items-center">
                <Col sm="3" className="fw-bold text-secondary1">
                    SPAD CREATOR
                </Col>
                <Col sm="3 fw-bold">
                    <EtherScanAddress address={spad.spadInitiator} showIcon={true} />
                </Col>
                <Col sm="6">
                    {/* {
                        props.spad.twitterHandle === '' ?
                        <>
                            {
                                address === props.spad.spadInitiator && 
                                <>
                                <TwitterVerification />
                                </>
                            }
                        </> :
                        <a href={'https://www.twitter.com/'+props.spad.twitterHandle} className="btn btn-color" target="_blank" rel="noreferrer">
                            <FaTwitter /> {" "}
                            { props.spad.twitterHandle }
                        </a>
                    } */}
                    
                </Col>
            </Row>
            <Row className="mb-4 align-items-center">
                <Col sm="3" className="fw-bold text-secondary1">
                    DTS SCORE
                </Col>
                <Col sm="5 fw-bold">
                    <iframe src={"https://dts-app-umber.vercel.app/score?address="+spad.spadInitiator} height="28" scrolling="no" />
                </Col>
            </Row>
            <Row className="mb-4 align-items-center">
                <Col sm="3" className="fw-bold text-secondary1">
                    CURRENCY
                </Col>
                <Col sm="3" className="fw-bold">
                    {spad.investmentCurrency}
                </Col>
                <Col sm="3" className="fw-bold text-secondary1">
                    CONTRIBUTION RANGE
                </Col>
                <Col sm="3" className="fw-bold">
                    {spad.minInvestmentView} {" "} {spad.investmentCurrency} 
                    {" "} <FaMinus /> {" "} 
                    {spad.maxInvestmentView} {" "} {spad.investmentCurrency}
                </Col>
            </Row>
            <Row className="mb-4">
                <Col sm="3" className="fw-bold text-secondary1">
                    SPAD PROGRESS
                </Col>
                <Col sm="9">
                    {
                        (spad.initiatorContribution > 0) ?
                        <ProgressBar>
                            <ProgressBar now={initiatorContriPct} key={1} variant="success1" title="SPAD Creator Contribution" />
                            <ProgressBar now={(Number(spad.currentInvstPercent) - Number(initiatorContriPct))} key={2} variant="color" />
                        </ProgressBar> : 
                        <ProgressBar>
                            <ProgressBar now={initiatorContriPct} key={1} variant="secondary1" />
                        </ProgressBar>
                    }
                    <Row className={styles.ContributionText}>
                        <Col>
                            <p className='text-color mt-2'>{spad.currentInvstPercent}% Contribution done</p>
                        </Col>
                        <Col>
                            <p className='mt-2 text-end'>
                                <span>{spad.currentInvestmentView}</span>/ 
                                <span>{spad.targetView}</span> 
                                {" "}{spad.investmentCurrency}
                            </p>
                        </Col>
                    </Row>
                </Col>
            </Row>
            <SpadActions spadAddress={spadAddress} spad={spad} loadSpad={loadSpad} />
        </Card>
    )
}

export default SpadDetailsCard;
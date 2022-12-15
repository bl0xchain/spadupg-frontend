import { Card, Placeholder, Spinner } from "react-bootstrap";

const SpadCardPlaceholder = ({ compact }) => {
    return (
        <>
        {
            compact ?
            <Card className="rounded p-4 mb-4 shadow compact">
                <Card.Body>
                    Loading... {" "} <Spinner animation="border" size="sm" />
                    <Placeholder as={Card.Title} animation="glow">
                        <Placeholder xs={6} />
                    </Placeholder>
                    <Placeholder as={Card.Text} animation="glow">
                        <Placeholder xs={7} /> <Placeholder xs={4} /> <Placeholder xs={4} />{' '}
                        <Placeholder xs={6} /> <Placeholder xs={8} />
                    </Placeholder>
                </Card.Body>
            </Card> :
            <Card className="rounded spad-card p-0 mb-4 shadow-lg">
                <Card.Body style={{width: '100%'}}>
                    <Placeholder as={Card.Title} animation="glow">
                        <Placeholder xs={6} />
                    </Placeholder>
                    <Placeholder as={Card.Text} animation="glow">
                        <Placeholder xs={7} /> <Placeholder xs={4} /> <Placeholder xs={4} />{' '}
                        <Placeholder xs={6} /> <Placeholder xs={8} />
                    </Placeholder>
                </Card.Body>
            </Card>
        }
        </>
        
    )
}

export default SpadCardPlaceholder;
import { Button, FormControl, Modal } from "react-bootstrap";

const PassKeyModal = ({show, setShow, passKey, setPassKey, handleAction}) => {
    return (
        <Modal show={show} centered={true} size="md" onHide={() => setShow(false)}>
            <Modal.Header closeButton>
                <Modal.Title>SPAD Pass Key</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <label>Enter Your Pass Key for the SPAD</label>
                <FormControl
                    placeholder="Your Pass Key"
                    type="text"
                    value={passKey}
                    onChange={(e) => setPassKey(e.target.value)}
                />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="default" onClick={() => setShow(false)}>
                    Cancel
                </Button>
                {
                    passKey ? 
                    <Button variant="color" onClick={handleAction}>
                        Proceed
                    </Button> :
                    <Button variant="color" disabled>
                        Proceed
                    </Button>
                }
                
            </Modal.Footer>
        </Modal>
    );
}

export default PassKeyModal;
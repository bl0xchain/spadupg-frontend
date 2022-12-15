import { Container } from "react-bootstrap";

const Footer = () => {
    return (
        <footer className="footer mt-auto py-3">
            <Container>
                <p className="text-left mb-0">
                    &copy; {(new Date().getFullYear())} {" "}
                    SPAD Finance
                </p>
            </Container>
        </footer>
    );
}
 
export default Footer;
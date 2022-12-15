import { Container } from "react-bootstrap"
import Link from "next/link";

const Forbidden = () => {
    return (
        <Container className="main-content d-flex text-center" style={{alignItems: 'center'}}>
            <div style={{margin: "auto"}}>
                <h2 className="mb-4" style={{fontSize: '60px', fontWeight: 'bold'}}>
                    <span className=" text-color">403</span>
                </h2>
                <h3 className="mb-4">This page could not be accessed.</h3>
                <Link href="/" className="btn btn-color btn-lg mt-4 mb-4">
                    Go to Home Page
                </Link>
            </div>
        </Container>
    );
}

export default Forbidden;
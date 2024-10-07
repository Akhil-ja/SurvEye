import { Container, Row, Col } from "react-bootstrap";

// eslint-disable-next-line react/prop-types
function FormContainer({ children }) {
  return (
    <Container>
      <Row className="justify-content-md-center mt-5">
        <Col xs={12} md={6}>
          <div
            className="card p-5 shadow-lg rounded"
            style={{ backgroundColor: "white", border: "none" }}
          >
            {children}
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default FormContainer;

import Navbar from "./components/Navbar";
import { Outlet } from "react-router-dom";
import Container from "react-bootstrap";

const App = () => {
  return (
    <>
      <Navbar />
      <Container className="my-2">
        <Outlet />
      </Container>
    </>
  );
};

export default App;

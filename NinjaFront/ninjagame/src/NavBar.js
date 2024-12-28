import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Container } from 'react-bootstrap';
import './Navbar.css'; // You can use a separate CSS file to style the navbar

const NavbarComponent = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
          <Nav className="ml-auto">
            <Nav.Link as={Link} to="/">Create Lobby</Nav.Link>
            <Nav.Link as={Link} to="/join">Join Lobby</Nav.Link>
          </Nav>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent;

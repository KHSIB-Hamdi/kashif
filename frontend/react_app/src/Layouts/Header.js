import React, { useState, useContext } from "react";
import {
  Navbar,
  Collapse,
  Nav,
  NavbarBrand,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Dropdown,
  Button,
} from "reactstrap";
import { ReactComponent as LogoWhite } from "../assets/images/logos/attijarilogowhite.svg";
import user1 from "../assets/images/users/Hamdi.png";
import { WebSocketContext } from '../WebSocketContext';
import { FaBell } from 'react-icons/fa';
import Alerts from '../components/dashboard/Alerts'

const Header = (props) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [alertsDropdownOpen, setAlertsDropdownOpen] = useState(false); // New state for alerts dropdown

  const { alerts , allAlerts} = useContext(WebSocketContext);

  const toggleAlertsDropdown = () => {
    setAlertsDropdownOpen((prevState) => !prevState);
  };

  const toggle = () => {setDropdownOpen((prevState) => !prevState)};
  const Handletoggle = () => {
    setIsOpen(!isOpen);
  };
  const showMobilemenu = () => {
    document.getElementById("sidebarArea").classList.toggle("showSidebar");
  };

  return (
    <Navbar color="dark" dark expand="md">
      <div className="d-flex align-items-center">
        <NavbarBrand href="/home" className="d-lg-none">
          <LogoWhite />
        </NavbarBrand>
        <Button
          color="dark"
          className="d-lg-none"
          onClick={() => showMobilemenu()}
        >
          <i className="bi bi-list"></i>
        </Button>
      </div>
      <div className="hstack gap-2">
        <Button
          color="dark"
          size="sm"
          className="d-sm-block d-md-none"
          onClick={Handletoggle}
        >
          {isOpen ? (
            <i className="bi bi-x"></i>
          ) : (
            <i className="bi bi-three-dots-vertical"></i>
          )}
        </Button>
        
      </div>


      <Collapse navbar isOpen={isOpen}>
        <Nav className="me-auto" navbar>
          
        </Nav>
        <Dropdown isOpen={alertsDropdownOpen} toggle={toggleAlertsDropdown}>
          <DropdownToggle color="dark">
            <FaBell className="text-white" size={24} />
            {alerts.length > 0 && (
              <span className="position-relative">
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {allAlerts.length}
                </span>
              </span>
            )}
          </DropdownToggle>
          <DropdownMenu end>
            <DropdownItem header>Notifications</DropdownItem>
            <DropdownItem>
              <Alerts />
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <Dropdown isOpen={dropdownOpen} toggle={toggle}>
          <DropdownToggle color="dark">
            <img
              src={user1}
              alt="profile"
              className="rounded-circle"
              width="30"
            ></img>
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem header>Informations</DropdownItem>
            <DropdownItem>Mon Compte</DropdownItem>
            {props.isAuthenticated ? (
            <DropdownItem href="/update_password">
              Modifier mot de passe
            </DropdownItem>
          ) : null}
            {props.isAuthenticated ? (
            <DropdownItem>
              <Button color="danger" onClick={() => props.logout()}>Déconnexion</Button>
            </DropdownItem>
          ) : null}
          </DropdownMenu>
        </Dropdown>
      </Collapse>
    </Navbar>
  );
};

export default Header;

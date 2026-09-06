import { Button, Nav, NavItem } from "reactstrap";
import Logo from "./Logo";
import { Link, useLocation } from "react-router-dom";

const navigation = [
  {
    title: "Tableau de bord",
    href: "/home",
    icon: "bi bi-speedometer2",
  },
  {
    title: "Administration",
    href: "/users",
    icon: "bi bi-people",
  },
  {
    title: "Transactions",
    href: "/transactions",
    icon: "bi bi-credit-card",
  },
  {
    title: "Analytique",
    href: "/powerbi",
    icon: "bi bi-graph-down",
  },
  {
    title: "Journal",
    href: "/doc",
    icon: "bi bi-journal",
  },
  {
    title: "Chat",
    href: "/chat",
    icon: "bi bi-chat-dots",
  },
 
];

const Sidebar = () => {
  const showMobilemenu = () => {
    document.getElementById("sidebarArea").classList.toggle("showSidebar");
  };
  let location = useLocation();

  return (
    <div className="p-3">
      <div className="d-flex align-items-center">
        <Logo />
        <span className="ms-auto d-lg-none">
        <Button
          close
          size="sm"
          className="ms-auto d-lg-none"
          onClick={() => showMobilemenu()}
        ></Button>
        </span>
      </div>
      <div className="pt-4 mt-2">
        <Nav vertical className="sidebarNav">
          {navigation.map((navi, index) => (
            <NavItem key={index} className="sidenav-bg">
              <Link
                to={navi.href}
                className={
                  location.pathname === navi.href
                    ? "text-primary nav-link py-3"
                    : "nav-link text-secondary py-3"
                }
              >
                <i className={navi.icon}></i>
                <span className="ms-3 d-inline-block">{navi.title}</span>
              </Link>
            </NavItem>
          ))}
          
        </Nav>
      </div>
    </div>
  );
};

export default Sidebar;

import { ReactComponent as LogoDark } from "../assets/images/logos/attijarilogo.svg";
import { Link } from "react-router-dom";

const Logo = () => {
  return (
    <Link to="/home">
      <LogoDark />
    </Link>
  );
};

export default Logo;

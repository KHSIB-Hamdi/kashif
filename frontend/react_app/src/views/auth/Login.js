import * as React from 'react';
import {Button} from "reactstrap";
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { connect } from 'react-redux';
import * as actions from '../../store/auth/authActions';
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "../../Layouts/Logo";


function Login(props) {

  let navigate = useNavigate();
  let location = useLocation();
  let { from } = location.state || { from: { pathname: "/home" } };

  React.useEffect(() => {
    if (props.isAuthenticated) { navigate(from.pathname, { replace: true }); };
  }, [props.isAuthenticated, from, navigate]);

  const [username, setuserName] = React.useState(null);
  const [password, setPassword] = React.useState(null);
  const [error, setError] = React.useState(null);

  const handleFormFieldChange = (event) => {
    switch (event.target.id) {
      case 'username': setuserName(event.target.value); break;
      case 'password': setPassword(event.target.value); break;
      default: return null;
    }

  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!username || !password) {
      setError('Le nom d`utilisateur et le mot de passe sont requis.');
      return;
    }
    setError(null);
    props.onAuth(username, password).catch(err => {
      setError('La connexion a échoué. Veuillez vérifier votre nom d`utilisateur ou votre mot de passe.');
    });
  };

  return (
    
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Logo />
          
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Identifiant"
              name="username"
              autoComplete="username"
              autoFocus
              onChange={handleFormFieldChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mot de passe"
              type="password"
              id="password"
              autoComplete="current-password"
              onChange={handleFormFieldChange}
            />
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
              <Button type="submit" className="btn" color="dark-blue">
                Se connecter
              </Button>
            </div>
            
          
          </Box>
        </Box>
        
      </Container>
  );
}

const mapDispatchToProps = dispatch => {
    return {
        onAuth: (username, password) => dispatch(actions.authLogin(username, password)) 
    }
}

export default connect(null, mapDispatchToProps)(Login);
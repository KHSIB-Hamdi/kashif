import React from 'react';
import axios from 'axios';
import * as settings from '../../settings';
import Box from '@mui/material/Box';
import {Button} from "reactstrap";

import { Container, CssBaseline, TextField } from '@mui/material';
import Logo from "../../Layouts/Logo";


function PasswordUpdate(props) {
  const [new_password1, setNewPassword1] = React.useState(null);
  const [new_password2, setNewPassword2] = React.useState(null);
  const [success, setSuccess] = React.useState(false);

  const handleFormFieldChange = (event) => {
    setSuccess(false);
    switch (event.target.id) {
      case 'new_password1': setNewPassword1(event.target.value); break;
      case 'new_password2': setNewPassword2(event.target.value); break;
      default: return null;
    }

  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (new_password1 !== new_password2) {
      alert("Les mots de passe doivent se correspondre!")
    } else {
      let headers = { 'Authorization': `Token ${props.token}` };
      let method = 'post';
      let url = settings.API_SERVER + '/api/auth/update_password/';
      let passwordFormData = new FormData();
      passwordFormData.append("new_password1", new_password1);
      passwordFormData.append("new_password2", new_password2);
      let config = { headers, method, url, data: passwordFormData};
      
      axios(config).then(res => {
        setSuccess(true);
      }).catch(
        error => {
          alert(error)
        })
    }

  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
        <Logo />
        <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="new_password1"
            label="Entrer un nouveau mot de passe"
            type="password"
            id="new_password1"
            onChange={handleFormFieldChange}
            

          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="new_password2"
            label="Entrer le mot de passe une autre fois"
            type="password"
            id="new_password2"
            onChange={handleFormFieldChange}
            error={new_password1 !== new_password2}
            helperText={new_password1 !== new_password2 ? "Les mots de passe doivent être équivalents!" : null}
          />
          <div className="button-group">
                <Button type="submit" className="btn" color="primary">
                  Modifier mot de passe
                </Button>
          </div>
          {success ? <p style={{ color: 'green' }}>Mot de passe modifié avec succès!</p> : null}
        </Box>
      </Box>
    </Container>
  );
}


export default PasswordUpdate;
import * as React from 'react';
import { Row, Col, Table, Card, CardTitle, CardBody,Breadcrumb,
  BreadcrumbItem, Button } from "reactstrap";
import { useDispatch, useSelector } from 'react-redux';  
import { fetchUsers, deleteUser } from '../../store/user/userActions';

const Users = () => {

  const dispatch = useDispatch();
  const users = useSelector(state => state.user.users); 
  
  React.useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleDelete = (id) => {
    dispatch(deleteUser(id));
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' }; // Format: August 5, 2024
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Row>
      <Col lg="12">
        <Breadcrumb>
          <BreadcrumbItem active>Administrateurs</BreadcrumbItem>
        </Breadcrumb>
      </Col>
      <Col lg="12">
        <Card>
        <CardTitle tag="h6" className="border-bottom p-3 mb-0 d-flex justify-content-between align-items-center">
            <div>
              <i className="bi bi-credit-card me-2"> </i>
              Liste des Administrateurs
            </div>
            <Button className="btn" color="secondary" href="/add-transaction">
              <i className="bi bi-patch-plus"> </i> Ajouter
            </Button>
          </CardTitle>
          <CardBody className="">
            <Table bordered hover>
              <thead>
                <tr>
                  <th>Identifiant</th>
                  <th>Email</th>
                  <th>Date de jointure</th>
                  <th>Dernière Connexion</th>
                  <th>Rôle</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{formatDate(user.date_joined)}</td> {/* Format date_joined */}
                    <td>{user.last_login ? formatDate(user.last_login) : 'Jamais connecté'}</td> {/* Format last_login */}
                    <td>Stagiaire</td> 
                    <td>
                      <div className="button-group">
                        <Button className="btn" color="info" href={`/update-user/${user.id}`}>
                          <i className="bi bi-pencil-square"> </i>
                        </Button>
                        <Button className="btn" color="danger" onClick={() => handleDelete(user.id)}>
                          <i className="bi bi-trash"> </i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default Users;

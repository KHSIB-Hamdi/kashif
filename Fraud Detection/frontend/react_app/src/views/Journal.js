import React, { useEffect, useState } from 'react';
import { Row, Col, Table, Card, CardTitle, CardBody,Breadcrumb,
  BreadcrumbItem } from "reactstrap";
import {  useDispatch, useSelector } from 'react-redux';
import {fetchAlerts} from '../store/alert/alertActions'
import { format } from 'date-fns';
import axios from 'axios';
import * as settings from '../settings';

const Journal = () => {
  const dispatch = useDispatch();
  const alerts = useSelector(state => state.alert.alerts);
  React.useEffect(() => {
    dispatch(fetchAlerts());
  }, [dispatch]);

  const formatDate = (timestamp) => {
    return format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss');
  };

  const [activities, setActivities] = useState([]);

  useEffect(() => {
    axios.get(`${settings.API_SERVER}/api/auth/user-activities/`)
      .then(response => {
        setActivities(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the user activities!', error);
      });
  }, []);

  const mapActionToFrench = (action) => {
    const actionMap = {
      'login': 'Connexion',
      'logout': 'Déconnexion'
    };
    return actionMap[action] || action; // Default to original action if not found in map
  };

  return (
    <Row>
      <Col lg="12">
        <Breadcrumb>
          <BreadcrumbItem active>Journal</BreadcrumbItem>
        </Breadcrumb>
      </Col>
      <Col lg="12">
        <Card>
          <CardTitle tag="h6" className="border-bottom p-3 mb-0">
            <i className="bi bi-journal me-2"> </i>
            Historique des alertes
          </CardTitle>
          <CardBody className="">
            <Table bordered>
              
              <tbody>
                {alerts.length > 0 ? (
                  alerts.map((alert, index) => (
                    <tr key={index}>
                      <td>{alert.message}</td>
                      <td>{formatDate(alert.timestamp)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="text-center">Pas d'alertes</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </CardBody>
        </Card>
      </Col>
      <Col lg="12">
        <Card>
          <CardTitle tag="h6" className="border-bottom p-3 mb-0">
            <i className="bi bi-journal me-2"> </i>
            Historique des activités des utilisateurs
          </CardTitle>
          <CardBody className="">
            <Table bordered>
              
              <tbody>
              {activities.map(activity => (
                <tr key={activity.id}>
                  <td>{activity.username}</td>
                  <td>{mapActionToFrench(activity.action)}</td>
                  <td>{formatDate(activity.timestamp)}</td>
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

export default Journal;

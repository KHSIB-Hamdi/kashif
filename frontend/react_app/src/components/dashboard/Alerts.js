import React, { useContext } from "react";
import { Card, CardBody, ListGroup, ListGroupItem } from "reactstrap";
import { WebSocketContext } from '../../WebSocketContext';
import { FaTriangleExclamation } from "react-icons/fa6";
import { format } from 'date-fns';


const Alerts = () => {
  const { alerts } = useContext(WebSocketContext);

  const formatDate = (timestamp) => {
    return format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss');
  };

  return (
    <Card>
      <CardBody>
        
        <ListGroup flush className="mt-4">
          {alerts.length > 0 ? (
            alerts.map((alert) => (
              <ListGroupItem key={alert.id} className="d-flex justify-content-between align-items-center">
              <div>
                <FaTriangleExclamation className="me-2 text-warning" />
                {formatDate(alert.timestamp)} - {alert.message} 
              </div>
              
            </ListGroupItem>
              ))
          ) : (
            <ListGroupItem className="text-center border-0">
              Pas de notifications.
            </ListGroupItem>
          )}
        </ListGroup>
      </CardBody>
    </Card>
  );
};

export default Alerts;

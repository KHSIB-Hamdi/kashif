import React, { useContext } from 'react';
import { Col, Row,Table, Card, CardTitle, CardBody } from "reactstrap";
import TransactionChart from "../components/dashboard/TransactionChart";
import ActivityChart from "../components/dashboard/ActivityChart";
import AlertChart from "../components/dashboard/AlertChart";
import RatingChart from "../components/dashboard/RatingChart";
import TopCards from "../components/dashboard/TopCards";
import { useSelector } from 'react-redux';
import { WebSocketContext } from '../WebSocketContext';
import { format } from 'date-fns';
import CompliancePieChart from "../components/dashboard/CompliancePieChart";

const Home = () => {
  const {allTransactions, recentTransactions, allAlerts} = useContext(WebSocketContext);
  const users = useSelector(state => state.user.users); 
  const num_users = users.length;
  const fraud_transactions = allTransactions.filter(transaction => transaction.IS_FRAUDULENT).length;
  
  const formatTimestamp = (timestamp) => {
    return format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss');
  };
  
  return (
    <div>
      {/***Top Cards***/}
      <Row>
        <Col sm="6" lg="3">
          <TopCards
            bg="bg-light-success text-success"
            title="Transactions analysées"
            subtitle="Transactions analysées"
            earning={allTransactions.length}
            icon="bi bi-graph-up"
          />
        </Col>
        <Col sm="6" lg="3">
          <TopCards
            bg="bg-light-danger text-danger"
            title="Refunds"
            subtitle="Cas de non-conformité"
            earning={fraud_transactions}
            icon="bi bi-incognito"
          />
        </Col>
        <Col sm="6" lg="3">
          <TopCards
            bg="bg-light-warning text-warning"
            title="Alertes"
            subtitle="Alertes"
            earning={allAlerts.length}
            icon="bi bi-exclamation-triangle"
          />
        </Col>
        <Col sm="6" lg="3">
          <TopCards
            bg="bg-light-info text-into"
            title="Users"
            subtitle="Utilisateurs"
            earning={num_users}
            icon="bi bi-people"
          />
        </Col>
      </Row>
     
      <Row>
  
  <Col lg="9" xxl="9">
    <TransactionChart />
  </Col>

  
  <Col lg="3" sm="12">
    <Row>
      
      <Col xs="12">
        <CompliancePieChart />
      </Col>
    </Row>
    <Row>
      
      <Col xs="12">
      <RatingChart />
      </Col>
    </Row>
  </Col>
</Row>

      <Row>
      <Col lg="6">
          <ActivityChart />
        </Col>
        <Col lg="6">
          <AlertChart />
        </Col>
        
        
      </Row>

     
      
      <Row>
        <Col lg="12" >
        <Card>
          <CardTitle tag="h6" className="border-bottom p-3 mb-0">
            <i className="bi bi-credit-card me-2"> </i>
            5 dernières transactions
          </CardTitle>
          <CardBody className="">
          <Table bordered hover>
              <thead>
                <tr>
                  <th>Produit</th>
                  <th>Montant</th>
                  <th>Date</th>
                  
                  
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map(transaction => (
                  <tr key={transaction.id}>
                    <td>{transaction.PRODUIT}</td>
                    <td>{transaction.MONTANT_TRX}</td>
                    <td>{formatTimestamp(transaction.DATE_TRX)}</td>
                    
                  </tr>
                ))}
              </tbody>
            </Table>
          </CardBody>
        </Card>
        
        </Col>
        
      </Row>   
    </div>
  );
};

export default Home;

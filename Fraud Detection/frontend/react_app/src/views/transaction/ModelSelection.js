import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Container, Card, CardBody, Button, Row, Col } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { predictTransaction } from '../../store/prediction/predictionActions';

const ModelSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const transaction = Object.fromEntries(queryParams.entries());
  const dispatch = useDispatch();
  const { loading, result, error } = useSelector(state => state.prediction);

  const handleModelSelection = (modelName) => {
    dispatch(predictTransaction(transaction, modelName));
  };

  React.useEffect(() => {
    if (result) {
      // There is no /prediction-result route (and no backend endpoint feeding
      // it) -- return to the transaction list rather than dead-ending on a
      // blank page. See docs/AUDIT.md (C6).
      navigate('/transactions');
    }
    if (error) {
      alert(`Error: ${error}`);
    }
  }, [result, error, transaction.id, navigate]);

  

  return (
    <Container className="mt-4">
        
      <h2>Selectionner un Modèle</h2>
      <Row>
        <Col md="4">
          <Card className="mb-4" body>
            <CardBody>
              <h4>Random Forest</h4>
              <p>Description </p>
              <Button onClick={() => handleModelSelection('RF')} disabled={loading} color="primary">{loading ? 'Predicting...' : 'Random Forest'}</Button>
            </CardBody>
          </Card>
        </Col>
        <Col md="4">
          <Card className="mb-4" body>
            <CardBody>
              <h4>XGBoost</h4>
              <p>Description of Model 2.</p>
              <Button onClick={() => handleModelSelection('XGB')} disabled={loading} color="primary">{loading ? 'Predicting...' : 'XGBoost'}</Button>
            </CardBody>
          </Card>
        </Col>
        <Col md="4">
          <Card className="mb-4" body>
            <CardBody>
              <h4>KNN</h4>
              <p>Description of Model 3.</p>
              <Button onClick={() => handleModelSelection('KNN')} disabled={loading} color="primary">{loading ? 'Predicting...' : 'KNN'}</Button>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ModelSelection;

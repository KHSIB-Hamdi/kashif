import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, CardTitle, Button, Form, FormGroup, Label, Input, Card, CardBody,
    BreadcrumbItem, Breadcrumb } from 'reactstrap';
import { fetchTransaction, updateTransaction } from '../../store/transaction/transactionActions'
import { useParams, useNavigate } from 'react-router-dom';

const TransactionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const transaction = useSelector(state => state.transaction.transactions.find(tx => tx.id === parseInt(id)));
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  React.useEffect(() => {
    if (transaction) {
      setDescription(transaction.description);
      setAmount(transaction.amount);
    } else {
      dispatch(fetchTransaction(id));
    }
  }, [dispatch, transaction, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateTransaction({ description, amount: parseFloat(amount) }, id));
      navigate('/transactions');
    } catch (error) {
      console.error('Failed to update transaction', error);
    }
  };

  return (
    <Row>
      <Col lg="12">
        <Breadcrumb>
          <BreadcrumbItem>
                <a href="/transactions">Transactions</a>
          </BreadcrumbItem>
          <BreadcrumbItem active>Modifier une transaction</BreadcrumbItem>
        </Breadcrumb>
      </Col>
      <Col>
        <Card>
          <CardTitle tag="h6" className="border-bottom p-3 mb-0">
            <i className="bi bi-credit-card me-2"> </i>
            Modifier une transaction
          </CardTitle>
          <CardBody>
          <Form onSubmit={handleSubmit}>
            <FormGroup>
                <Label for="description">Description</Label>
                <Input
                type="text"
                name="description"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                />
            </FormGroup>
            <FormGroup>
                <Label for="amount">Amount</Label>
                <Input
                type="number"
                name="amount"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                />
            </FormGroup>
            <Button type="submit" color="primary">Modifier</Button>
            </Form>
          </CardBody>
        </Card>
      </Col>
    </Row>
   
  );
}

export default TransactionForm;
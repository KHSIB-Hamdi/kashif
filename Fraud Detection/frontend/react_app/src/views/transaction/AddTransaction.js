import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Row, Col, CardTitle, Button, Form, FormGroup, Label, Input, Card, CardBody,
    BreadcrumbItem, Breadcrumb } from 'reactstrap';
import { addTransaction } from '../../store/transaction/transactionActions'

const TransactionForm = () => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(addTransaction({ description, amount: parseFloat(amount) }));
    setDescription('');
    setAmount('');
  }

  return (
    <Row>
      <Col lg="12">
        <Breadcrumb>
          <BreadcrumbItem>
                <a href="/transactions">Transactions</a>
          </BreadcrumbItem>
          <BreadcrumbItem active>Ajouter une transaction</BreadcrumbItem>
        </Breadcrumb>
      </Col>
      <Col>
        <Card>
          <CardTitle tag="h6" className="border-bottom p-3 mb-0">
            <i className="bi bi-credit-card me-2"> </i>
            Ajouter une transaction
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
            <Button type="submit" color="primary">Ajouter</Button>
            </Form>
          </CardBody>
        </Card>
      </Col>
    </Row>
   
  );
}

export default TransactionForm;
import React, { useState, useMemo, useEffect } from 'react';
import { Row, Col, Table, Card, CardTitle, CardText, CardBody, Breadcrumb, BreadcrumbItem, Button, Badge,Modal , ModalHeader, ModalBody, ModalFooter, Form,FormGroup, Label, Input } from "reactstrap";
import { useDispatch, useSelector } from 'react-redux';  
import { fetchTransactions, deleteTransaction } from '../../store/transaction/transactionActions';
import { useTable, useSortBy, useFilters } from 'react-table';
import { FaExclamationTriangle } from 'react-icons/fa';
import { FaBrain } from 'react-icons/fa';
import axios from 'axios';
import * as settings from '../../settings';
import GaugeChart from 'react-gauge-chart';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { addComment } from '../../store/comment/commentActions';
import RadioGroupRating from '../../components/dashboard/RadioGroupRating';
import { format } from 'date-fns';
import TablePagination from '@mui/material/TablePagination';



function DefaultColumnFilter({ column: { id, filterValue }, handleFilterChange }) {
  const [inputValue, setInputValue] = useState(filterValue || '');
  const [debounceTimeout, setDebounceTimeout] = useState(null);

  useEffect(() => {
    // Sync local state with filterValue
    setInputValue(filterValue || '');
  }, [filterValue]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    // Clear the previous timeout if there is one
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Only trigger API call if the input value has at least 3 characters
    if (value.length >= 3 || value.length === 0) {
      const newTimeout = setTimeout(() => {
        handleFilterChange(id, value || undefined); // Only trigger API call when typing stops
      }, 500); // 500ms debounce delay (adjust as needed)

      setDebounceTimeout(newTimeout);
    }
  };

  return (
    <input
      value={inputValue}
      onChange={handleInputChange}
      placeholder={'Filtrer...'}
    />
  );
}



const SelectColumnFilter = ({ column: { filterValue, setFilter }, handleFilterChange, fieldName }) => {
  const [options, setOptions] = useState([]);

  // Fetch distinct values from the backend when the component mounts
  useEffect(() => {
    const fetchDistinctValues = async () => {
      try {
        const response = await axios.get(`${settings.API_SERVER}/api/transactions/distinct/${fieldName}/`);
        setOptions(response.data);  // Set the options from the backend response
      } catch (error) {
        console.error('Error fetching distinct values:', error);
      }
    };

    fetchDistinctValues();
  }, [fieldName]);

  return (
    <select
      value={filterValue || ''}
      onChange={e => {
        setFilter(e.target.value || undefined);  // Set the filter value
        handleFilterChange(fieldName, e.target.value);  // Notify parent component of filter change
      }}
    >
      <option value="">All</option>
      {options.map(option => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};

const Transactions = () => {
  const dispatch = useDispatch();
  const transactions = useSelector(state => state.transaction.transactions || []);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [filters, setFilters] = useState({});
  const user = useSelector(state => state.auth.user);
  const [rating, setRating] = useState(null);
  const [newComment, setNewComment] = useState(''); 
  const [modal, setModal] = useState(false);
  const [modelPerformanceId, setModelPerformanceId] = useState(null);
  const next = useSelector(state => state.transaction.next);
  const previous = useSelector(state => state.transaction.previous);
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const totalTransactions = useSelector(state => state.transaction.total || 0);

  const toggleModal = () => setModal(!modal);
  const [newPredictionInput, setNewPredictionInput] = useState('');

  const handleNewPrediction = () => {
    
    
    toggleModal(); 
  };

  const formatTimestamp = (timestamp) => {
    return format(new Date(timestamp), 'yyyy-MM-dd HH:mm:ss');
  };
  const openModal = async (transactionId) => {
    
    
    try {
      const response = await axios.get(`${settings.API_SERVER}/api/transactions/${transactionId}/details/`);
      setSelectedTransaction(response.data);
      
      const modelPerformance = response.data.model_performance;
      
      if (modelPerformance) {
        setModelPerformanceId(modelPerformance[0].id); 
        setModelMetrics(modelPerformance);
      }
      
      setModalIsOpen(true);
    } catch (error) {
      console.error('Error fetching transaction details:', error);
    }
  };


  const handleAddComment = async () => {
    const commentData = {
      user: user.id, 
      content: newComment,
      subject: 'Cas de non conformité'
    };
    
    await dispatch(addComment(commentData));
    setNewComment(''); 
    
    
    
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedTransaction(null);
    setModelMetrics(null);
  };
  const handleFilterChange = (columnId, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [columnId]: value
    }));
  };

  React.useEffect(() => {
    dispatch(fetchTransactions(filters,currentPage + 1, rowsPerPage));
  }, [filters, currentPage, rowsPerPage, dispatch]);

  const handleDelete = (id) => {
    dispatch(deleteTransaction(id));
  };
  
  
  const handlePageChange = (event, newPage) => {
    if (newPage > currentPage && next) { // Going forward, check if there is a next page
      setCurrentPage(newPage);
    } else if (newPage < currentPage && previous) { // Going back, check if there is a previous page
      setCurrentPage(newPage);
    }
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(0); 
  };

  

  const handleRatingChange = async (e, newValue) => {
    
    setRating(newValue);
  
    if (!modelPerformanceId) {
      console.error('Model Performance ID is not available');
      return;
    }
  
    
  
    try {
      const response = await axios.post(`${settings.API_SERVER}/api/model-rating/${modelPerformanceId}/`, {
        user: user.id,
        rating: newValue
      });
  
      
    } catch (error) {
      console.error('Error submitting rating:');
    }
  };
  

  

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const [filterVisibility, setFilterVisibility] = useState({});

  const toggleFilterVisibility = columnId => {
    setFilterVisibility(prev => ({
      ...prev,
      [columnId]: !prev[columnId]
    }));
  };

  const getRowStyle = (isFraud) => {
    return isFraud ? { backgroundColor: '#f8d7da' } : {}; 
  }
  

  const columns = useMemo(
    () => [
      { Header: 'Id', accessor: 'id', Filter: ({ column }) => <DefaultColumnFilter column={column} handleFilterChange={handleFilterChange} /> },
      { Header: 'Produit', accessor: 'PRODUIT', Filter: ({ column }) => <SelectColumnFilter column={column} handleFilterChange={handleFilterChange} fieldName={'PRODUIT'} /> },
      { Header: 'Devise', accessor: 'DEV_CPTE', Filter: ({ column }) => <SelectColumnFilter column={column} handleFilterChange={handleFilterChange} fieldName={'DEV_CPTE'}/> },
      { Header: 'Lib. Compte', accessor: 'LIB_CPTE', Filter: ({ column }) => <SelectColumnFilter column={column} handleFilterChange={handleFilterChange} fieldName={'LIB_CPTE'} /> },
      { Header: 'Montant', accessor: 'MONTANT_TRX',Cell: ({ value }) => parseFloat(value), Filter: ({ column }) => <DefaultColumnFilter column={column} handleFilterChange={handleFilterChange} /> },
      { Header: 'Utilisation', accessor: 'UTILISATION', Filter: ({ column }) => <DefaultColumnFilter column={column} handleFilterChange={handleFilterChange} /> },
      { Header: 'Emp.', accessor: 'EMPLACEMENT', Filter: ({ column }) => <DefaultColumnFilter column={column} handleFilterChange={handleFilterChange} />},
      { Header: 'Territoire', accessor: 'TERRITOIRE', Filter: ({ column }) => <SelectColumnFilter column={column} handleFilterChange={handleFilterChange} fieldName={'TERRITOIRE'}/> },
      {
        Header: 'Date',
        accessor: 'DATE_TRX',
        Cell: ({ value }) => formatDate(value),
        Filter: ({ column }) => <DefaultColumnFilter column={column} handleFilterChange={handleFilterChange} />,
      },
      {
        Header: 'Statut',
        accessor: 'IS_FRAUDULENT',
        Cell: ({ value }) => (
          value == 1 ? (
            <Badge color="danger">
              Non conforme 
            </Badge>
          ) : (
            <Badge color="success">
              Conforme
            </Badge>
          )
        ),
        disableFilters: true,
      },
      {
        Header: 'Modèle IA',
        Cell: ({ row }) => (
          <div className="button-group">
            <Button className="gradient-button"  onClick={() => openModal(row.original.id)}>
              <FaBrain /> 
            </Button>
          </div>
        ),
        disableFilters: true,
      },
      {
        Header: 'Actions',
        Cell: ({ row }) => (
          <div className="button-group">
            <Button className="btn" color="info" href={`/update-transaction/${row.original.id}`}>
              <i className="bi bi-pencil-square"> </i>
            </Button>
            <Button className="btn" color="danger" onClick={() => handleDelete(row.original.id)}>
              <i className="bi bi-trash"> </i>
            </Button>
          </div>
        ),
        disableFilters: true,
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    rows
  } = useTable(
    {
      columns,
      data: transactions,
      initialState: { pageIndex: 0 },
      defaultColumn: { Filter: DefaultColumnFilter },
    },
    useFilters,
    useSortBy
  );

  const renderPredictionIcon = (prediction) => {
    if (prediction === true) {
      return (<div className="d-flex align-items-center"><FaTimesCircle size={30} color="FF0000" />
      <p>Transaction non conforme</p>
       </div>);
    }
    return (<div className="d-flex align-items-center"><FaCheckCircle size={40} color="06D001" style={{marginBottom:'10px', marginLeft:'20px'}}/>
    <p style={{marginLeft:'35px', marginTop:'10px'}}>Transaction conforme</p>
    </div>);
  };

  return (
    <Row>
      <Col lg="12">
      
        <Breadcrumb>
          <BreadcrumbItem active>Transactions</BreadcrumbItem>
        </Breadcrumb>
      </Col>
      <Col lg="12">
        <Card>
          <CardTitle tag="h6" className="border-bottom p-3 mb-0 d-flex justify-content-between align-items-center">
            <div>
              <i className="bi bi-credit-card me-2"> </i>
              Liste des transactions
            </div>
            <Button className="btn" color="secondary" href="/add-transaction">
              <i className="bi bi-patch-plus"> </i>Ajouter
            </Button>
          </CardTitle>
          <CardBody className="">
            <Table {...getTableProps()} className="table table-bordered table-hover">
            <thead>
  {headerGroups.map(headerGroup => (
    
    <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}> 
    
      {headerGroup.headers.map(column => (
        <th {...column.getHeaderProps()} key={column.id}> 
        
          <div className="d-flex justify-content-between align-items-center">
            <div {...column.getSortByToggleProps()}>
              {column.render('Header')}
              <span>
                {column.isSorted
                  ? column.isSortedDesc
                    ? <i className="bi bi-arrow-down"></i>
                    : <i className="bi bi-arrow-up"></i>
                  : ''}
              </span>
            </div>
            {column.canFilter && (
              <div className="d-flex align-items-center">
                <i
                  className="bi bi-filter"
                  style={{ cursor: 'pointer', marginLeft: '10px' }}
                  onClick={() => toggleFilterVisibility(column.id)}
                ></i>
              </div>
            )}
          </div>
          {filterVisibility[column.id] && (
            <div>{column.render('Filter')}</div>
          )}
        </th>
      ))}
    </tr>
  ))}
</thead>
<tbody {...getTableBodyProps()}>
  {Array.isArray(transactions) && transactions.length > 0 ? (
    rows.map(row => {
      prepareRow(row);
      return (
        <tr
          {...row.getRowProps()}
          key={row.id || row.original.id} 
          style={getRowStyle(row.original.IS_FRAUDULENT)}
        >
          {row.cells.map(cell => (
            <td {...cell.getCellProps()} key={cell.column.id + row.id}>
              {cell.render('Cell')}
            </td>
          ))}
        </tr>
      );
    })
  ) : (
    <tr>
      <td colSpan={columns.length}>Pas de transactions.</td>
    </tr>
  )}
</tbody>
            </Table>
            <TablePagination
              component="div"
              count={totalTransactions}
              page={currentPage}
              onPageChange={handlePageChange}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleRowsPerPageChange}
              rowsPerPageOptions={[10, 20, 50, 100]}
              nextIconButtonProps={{ disabled: !next }}  
              backIconButtonProps={{ disabled: !previous }}
            />
            <Modal isOpen={modalIsOpen} toggle={closeModal} centered size="lg">
            <ModalHeader toggle={closeModal}>
              <div className="d-flex align-items-center">
                <FaBrain className="me-2" /> 
                <span>Détails du modèle d'intelligence artificielle</span>
              </div>
            </ModalHeader>
            <ModalBody>
              <Row>
              <Col md="6" lg="7" >
              <Card>
                <CardBody>
                  <CardTitle tag="h6"><i className="bi bi-credit-card me-2"> </i>Transaction</CardTitle>
                  <div className="border-bottom mb-3" style={{ borderColor: '#dee2e6', borderWidth: '1px' }}></div>
                  {selectedTransaction ? (
                    <div>
                      <CardText><strong>Date:</strong> {formatTimestamp(selectedTransaction.DATE_TRX)}</CardText>
                      <CardText><strong>Montant:</strong> {parseFloat(selectedTransaction.MONTANT_TRX)}</CardText>
                    </div>
                  ) : (
                    <CardText>Pas de détail dipsonible.</CardText>
                  )}
                </CardBody>
              </Card>
              </Col>
              <Col md="6" lg="5">
              <Card>
                <CardBody>
                  <CardTitle tag="h6"><i className="bi bi-check2-square me-2"> </i>Résulat de la prédiction</CardTitle>
                  <div className="border-bottom mb-3" style={{ borderColor: '#dee2e6', borderWidth: '1px' }}></div>
                  {selectedTransaction ? (
                  <div className="d-flex align-items-center mb-3">
                    {renderPredictionIcon(selectedTransaction.IS_FRAUDULENT)}
                  </div>
                  ):(
                  <CardText>Pas de détail dipsonible.</CardText>)}
                </CardBody>
              </Card>
              
              </Col>
              </Row>
              <Card className="mt-4">
                <CardBody>
                  <CardTitle tag="h6"><i className="bi bi-speedometer2 me-2"> </i>Performance du modèle automatique (Random Forest)</CardTitle>
                  <div className="border-bottom mb-3" style={{ borderColor: '#dee2e6', borderWidth: '1px' }}></div>
                  {modelMetrics ? (
                  <div className="d-flex justify-content-between align-items-center" style={{ marginLeft: '100px' ,marginRight: '100px'}}>
                  
                    <GaugeChart
                      id="gauge-chart"
                      nrOfLevels={30}
                      percent={modelMetrics[0].accuracy || 0}
                      textColor="#000"
                      style={{ height: '300px', width: '300px', marginRight: '30px',marginTop:'30px' }}
                    />
                    <div className="mt-3">
                      <CardText><strong>Accuracy:</strong> {(modelMetrics[0].accuracy * 100).toFixed(2)}%</CardText>
                      <CardText><strong>Precision:</strong> {(modelMetrics[0].precision * 100).toFixed(2)}%</CardText>
                      <CardText><strong>Recall:</strong> {(modelMetrics[0].recall * 100).toFixed(2)}%</CardText>
                      <CardText><strong>F1 Score:</strong> {(modelMetrics[0].f1_score * 100).toFixed(2)}%</CardText>
                    </div>
                  </div>
                
                  ) : (
                    <CardText>Pas de métriques disponibles.</CardText>
                  )}
                  <div className="d-flex align-items-center">
                      <p style={{marginTop:'10px',marginRight:'20px'}}>Comment êtes-vous satisifait avec le modèle implémenté?</p>
                      <RadioGroupRating value={rating} onChange={handleRatingChange}  />
                    </div>
                    <Button color="primary" className="mt-3" onClick={toggleModal}>
                      Predire encore ?
                    </Button>
                    <Modal isOpen={modal} toggle={toggleModal}>
                      <ModalHeader toggle={toggleModal}>New Prediction</ModalHeader>
                      <ModalBody>
                        <Form>
                          <FormGroup>
                            <Label for="newPredictionInput">Enter Data for Prediction</Label>
                            <Input
                              type="text"
                              id="newPredictionInput"
                              value={newPredictionInput}
                              onChange={(e) => setNewPredictionInput(e.target.value)}
                              placeholder="Enter necessary data"
                            />
                          </FormGroup>
                        </Form>
                      </ModalBody>
                      <ModalFooter>
                        <Button color="primary" onClick={handleNewPrediction}>Submit Prediction</Button>{' '}
                        <Button color="secondary" onClick={toggleModal}>Cancel</Button>
                      </ModalFooter>
                    </Modal>
                </CardBody>
              </Card>
              <Card className="mt-4">
                  <CardBody>
                    <CardTitle tag="h6"><i className="bi bi-chat-dots me-2"></i>Commentaires</CardTitle>
                    <div className="border-bottom mb-3" style={{ borderColor: '#dee2e6', borderWidth: '1px' }}></div>
                    <FormGroup>
                      <Label for="newComment">Ajouter un commentaire</Label>
                      <Input
                        id="newComment"
                        type="textarea"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                    </FormGroup>
                    
                    <Button color="primary" onClick={handleAddComment}>Ajouter</Button>
                    
                  </CardBody>
                </Card>
                
                    
                  
            </ModalBody>
            <ModalFooter>
              <Button color="danger" onClick={closeModal}>Fermer</Button>
            </ModalFooter>
          </Modal>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default Transactions;

import {
    FETCH_TRANSACTIONS_SUCCESS,
    FETCH_TRANSACTION_SUCCESS,
    ADD_TRANSACTION_SUCCESS,
    UPDATE_TRANSACTION_SUCCESS,
    DELETE_TRANSACTION_SUCCESS
  } from './transactionActions';


  const initialState = {
    transactions: [],
    total: 0, 
    error: null,
    next: null,
    previous: null
  }; 


  const transactionReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_TRANSACTIONS_SUCCESS:
        return {
          ...state,
          transactions: action.payload.transactions,
          total: action.payload.total,
          next: action.payload.next,
          previous: action.payload.previous,
            
        };
      case FETCH_TRANSACTION_SUCCESS:
        return { ...state,
          transactions: state.transactions.map(tx => tx.id === action.payload.id ? action.payload : tx),
          loading: false
        };  
      case ADD_TRANSACTION_SUCCESS:
        return { ...state, transactions: [...state.transactions, action.payload] };
      case UPDATE_TRANSACTION_SUCCESS:
        return {
          ...state,
          transactions: state.transactions.map(tx => tx.id === action.payload.id ? action.payload : tx),
        };
      case DELETE_TRANSACTION_SUCCESS:
        return {
          ...state,
          transactions: state.transactions.filter(transaction => transaction.id !== action.payload)
        };
      default:
        return state;
    }
  }
  
  export default transactionReducer;  
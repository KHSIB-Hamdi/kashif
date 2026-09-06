import axios from 'axios';
import * as settings from '../../settings';

export const FETCH_TRANSACTIONS_SUCCESS = 'FETCH_TRANSACTIONS_SUCCESS';
export const FETCH_TRANSACTION_SUCCESS = 'FETCH_TRANSACTION_SUCCESS';
export const ADD_TRANSACTION_SUCCESS = 'ADD_TRANSACTION_SUCCESS';
export const UPDATE_TRANSACTION_SUCCESS = 'UPDATE_TRANSACTION_SUCCESS';
export const DELETE_TRANSACTION_SUCCESS = 'DELETE_TRANSACTION_SUCCESS';



export const fetchTransactions = (filters = {}, page = 1,rowsPerPage = 10) => async (dispatch) => {
  let queryString = Object.keys(filters)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(filters[key])}`)
      .join('&');
  const endpoint = `${settings.API_SERVER}/api/transactions?${queryString}&page=${page}&page_size=${rowsPerPage}`;

  try {
    
    const response = await axios.get(endpoint);

    const { results, count, next, previous } = response.data;
    
    dispatch({
      type: FETCH_TRANSACTIONS_SUCCESS,
      payload: {
        transactions: results,
        total: count,
        next: next,
        previous: previous
      }
    });
    
  } catch (error) {
    console.error('Error in fetchTransactions:', error);  
  }
};

export const fetchTransaction = (id) => {
    return dispatch => {
      axios.get(`${settings.API_SERVER}/api/transactions/${id}/`)
        .then(res => {
          dispatch({ type: FETCH_TRANSACTION_SUCCESS, payload: res.data });
        })
        .catch(err => console.error(err));
    }
}

export const addTransaction = (transaction) => {
    return dispatch => {
      axios.post(`${settings.API_SERVER}/api/transactions/`, transaction)
        .then(res => {
          dispatch({ type: ADD_TRANSACTION_SUCCESS, payload: res.data });
        })
        .catch(err => console.error(err));
    }
}

export const updateTransaction = (transaction, id) => {
    return dispatch => {
      axios.put(`${settings.API_SERVER}/api/transactions/update/${id}/`, transaction)
        .then(res => {
          dispatch({ type: UPDATE_TRANSACTION_SUCCESS, payload: res.data });
        })
        .catch(err => console.error(err));
    }
}

export const deleteTransaction = (id) => {
    return dispatch => {
      axios.delete(`${settings.API_SERVER}/api/transactions/delete/${id}/`)
        .then(() => {
          dispatch({ type: DELETE_TRANSACTION_SUCCESS, payload: id });
        })
        .catch(err => console.error(err));
    }
}
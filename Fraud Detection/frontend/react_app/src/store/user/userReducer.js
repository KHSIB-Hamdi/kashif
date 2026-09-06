import {
    FETCH_USERS_SUCCESS,
    FETCH_USER_SUCCESS,
    ADD_USER_SUCCESS,
    UPDATE_USER_SUCCESS,
    DELETE_USER_SUCCESS
  } from './userActions';


  const initialState = {
    users: []
  }; 


  const userReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_USERS_SUCCESS:
        return { ...state, users: action.payload };
      case FETCH_USER_SUCCESS:
        return { ...state,
          users: state.users.map(tx => tx.id === action.payload.id ? action.payload : tx),
          loading: false
        };  
      case ADD_USER_SUCCESS:
        return { ...state, users: [...state.users, action.payload] };
      case UPDATE_USER_SUCCESS:
        return {
          ...state,
          users: state.users.map(tx => tx.id === action.payload.id ? action.payload : tx),
        };
      case DELETE_USER_SUCCESS:
        return {
          ...state,
          users: state.users.filter(user => user.id !== action.payload)
        };
      default:
        return state;
    }
  }
  
  export default userReducer;  
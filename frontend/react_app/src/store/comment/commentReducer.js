import {
    FETCH_COMMENTS_SUCCESS,
    FETCH_COMMENT_SUCCESS,
    ADD_COMMENT_SUCCESS,
    UPDATE_COMMENT_SUCCESS,
    DELETE_COMMENT_SUCCESS
  } from './commentActions';


  const initialState = {
    comments: [],
    
    error: null,
  }; 


  const commentReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_COMMENTS_SUCCESS:
        return {
          ...state,
          comments: action.append 
            ? [...state.comments, ...action.payload]  
            : action.payload
        };
      case FETCH_COMMENT_SUCCESS:
        return { ...state,
          comments: state.comments.map(tx => tx.id === action.payload.id ? action.payload : tx),
          loading: false
        };  
      case ADD_COMMENT_SUCCESS:
        return { ...state, comments: [...state.comments, action.payload] };
      case UPDATE_COMMENT_SUCCESS:
        return {
          ...state,
          comments: state.comments.map(tx => tx.id === action.payload.id ? action.payload : tx),
        };
      case DELETE_COMMENT_SUCCESS:
        return {
          ...state,
          comments: state.comments.filter(comment => comment.id !== action.payload)
        };
      default:
        return state;
    }
  }
  
  export default commentReducer;  
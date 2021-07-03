import * as constants from './constants'

const INITIAL_STATE = {
  bids: {},
  asks: {},
  psnap: {},
  mcnt: 0
}

function OrderBookReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case constants.GET_BOOK:
      return {
        ...state,
        ...action.payload,
      }
  
    default:
      return state;
  }
}

export default OrderBookReducer;
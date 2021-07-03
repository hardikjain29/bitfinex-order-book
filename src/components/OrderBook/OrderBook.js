import React, { useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux'
import { throttle } from 'lodash';
import { getBook } from '../../app/actions';
import connection from './websocket';

const OrderBook = ({ orderBook }) => {
  const [precision, setPrecision] = useState("P0");
  const [connectionStatus, setConnectionStatus] = useState(true);
  const dispatch = useDispatch();
  
  const getBookss = () => {
    const getBooks = throttle((b) => dispatch(getBook(b)), 800);
    connection({ getBook: getBooks, precision, connectionStatus, setConnectionStatus });
  }

  useEffect(() => {
    getBookss();
  }, [connectionStatus, precision])


const buyer = orderBook ? Object.values(orderBook.bids) : [];
const seller = orderBook ? Object.values(orderBook.asks) : [];

const onPrecisionChange = (e) => {
  setConnectionStatus(!connectionStatus);
  setPrecision(e.target.value);
  setConnectionStatus(!connectionStatus);
}

  return (
    <div className="order-book">
      <div class="header">
        <h4>Order Book</h4>
        <div className="global-actions">
          <button className="button button-outline" onClick={() => setConnectionStatus(!connectionStatus)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 20V4M17 4L20 7M17 4L14 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M7 4V20M7 20L10 17M7 20L4 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <select name="precision" id="precision" onChange={onPrecisionChange}>
            <option value="P0">P0</option>
            <option value="P1">P1</option>
            <option value="P2">P2</option>
            <option value="P3">P3</option>
            <option value="P4">P4</option>
          </select>
        </div>
      </div>
      <div class="order-book-wrapper">
      <table>
        <thead>
          <tr>
            <th>Count</th>
            <th>Amount</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {
            buyer.map((b) => (
              <tr>
                <td>{b.cnt}</td>
                <td>{b.amount}</td>
                <td>{b.price}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
      <table>
        <thead>
          <tr>
            <th>Count</th>
            <th>Amount</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
        {
            seller.map((b) => (
              <tr>
                <td>{b.cnt}</td>
                <td>{b.amount}</td>
                <td>{b.price}</td>
              </tr>
            ))
          }
        </tbody>
      </table>
      </div>
    </div>  
  )
}

const mapStateToProps = state => ({
  orderBook: state.orderBook,
});

export default connect(mapStateToProps)(OrderBook);
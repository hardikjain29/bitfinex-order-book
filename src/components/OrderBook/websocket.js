import CRC from 'crc-32';
import _ from 'lodash';
import { throttle } from 'lodash';

let connected = false
let connecting = false
let WebSockets;

const connection = ({ getBook, precision, connectionStatus, setConnectionStatus }) => {
  if (!connecting && !connected) {
    WebSockets = new WebSocket('wss://api-pub.bitfinex.com/ws/2') 
  } 
  
  if (!connectionStatus) {
    WebSockets.close();
    return;
  }

  if (connecting || connected) {
    return;
  }

  connecting = true

  let message = JSON.stringify({ 
    event: 'subscribe', 
    channel: 'book', 
    symbol: 'tBTCUSD',
    prec: precision
  })
  

  const BOOK = {}
  let seq = null

  WebSockets.onopen = () => {
    BOOK.bids = {};
    BOOK.asks = {};
    BOOK.psnap = {
      bids: [],
      asks: [],
    };
    BOOK.mcnt = 0;
    connecting = false
    connected = true
    WebSockets.send(JSON.stringify({ event: 'conf', flags: 131072 }))
    WebSockets.send(message)
    setConnectionStatus(true);
  }

  WebSockets.onclose = () => {
    seq = null
    connecting = false
    connected = false
    console.log('WS close')
    setConnectionStatus(false);
  }

  WebSockets.onmessage = (message) => {
    let msg = JSON.parse(message.data) || [];
    // console.log (msg);
  

    // console.log(msg);
    if (msg[1] === 'hb') {
      seq = +msg[2]
      return
    } else if (msg[1] === 'cs') {
      seq = +msg[3]

      let checksum = msg[2]
      let csdata = []
      let bids_keys = BOOK.psnap['bids']
      let asks_keys = BOOK.psnap['asks']

      for (let i = 0; i < 25; i++) {
        if (bids_keys[i]) {
          let price = bids_keys[i]
          let pp = BOOK.bids[price]
          csdata.push(pp.price, pp.amount)
        }
        if (asks_keys[i]) {
          let price = asks_keys[i]
          let pp = BOOK.asks[price]
          csdata.push(pp.price, -pp.amount)
        }
      }

      let cs_str = csdata.join(':')
      let cs_calc = CRC.str(cs_str)

      if (cs_calc !== checksum) {
        console.error('CHECKSUM_FAILED')
      }
      return
    }

    if (BOOK.mcnt === 0) {
      _.each(msg[1], function (pp) {
        pp = { price: pp[0], cnt: pp[1], amount: pp[2] }
        let side = pp.amount >= 0 ? 'bids' : 'asks'
        pp.amount = Math.abs(pp.amount)
        BOOK[side][pp.price] = pp
      })
    } else {
      let cseq = +msg[2]
      msg = msg[1]

      if (!seq) {
        seq = cseq - 1
      }

      if (cseq - seq !== 1) {
        console.error('OUT OF SEQUENCE', seq, cseq)
      }

      seq = cseq

      if (!msg) {
        msg = [];
      }

      let pp = { price: msg[0], cnt: msg[1], amount: msg[2] }

        if (!pp.cnt) {
          let found = true
  
          if (pp.amount > 0) {
            if (BOOK['bids'][pp.price]) {
              delete BOOK['bids'][pp.price]
            } else {
              found = false
            }
          } else if (pp.amount < 0) {
            if (BOOK['asks'][pp.price]) {
              delete BOOK['asks'][pp.price]
            } else {
              found = false
            }
          }
  
          if (!found) {
            //fs.appendFileSync(logfile, '[' + moment().format() + '] ' + pair + ' | ' + JSON.stringify(pp) + ' BOOK delete fail side not found\n')
          }
        } else {
          let side = pp.amount >= 0 ? 'bids' : 'asks'
          pp.amount = Math.abs(pp.amount)
          BOOK[side][pp.price] = pp
        }
      }
  
        _.each(['bids', 'asks'], function (side) {
          let sbook = BOOK[side]
          let bprices = Object.keys(sbook)
    
          let prices = bprices.sort(function (a, b) {
            if (side === 'bids') {
              return +a >= +b ? -1 : 1
            } else {
              return +a <= +b ? -1 : 1
            }
          })
    
          BOOK.psnap[side] = prices
        })
    
        BOOK.mcnt++;
        getBook(BOOK);
  };

  return WebSockets;
}

export default connection;
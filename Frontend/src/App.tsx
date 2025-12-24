import Checkout from "./Page/Checkout";
import Header from "./Page/header"
import Home from "./Page/Home";
import Invoice from "./Page/Invoice";
import ProductView from "./Page/ProductDetails";
import Topbar from "./Page/Topbar"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {

  return (
    <>
 <Router>
      <Topbar />
      <Header/>     
      <Routes>
        <Route path="/" element={< Home/>} />
         <Route path="/product/:id" element={<ProductView />} />
         <Route path="/checkout" element={<Checkout />} />
         <Route path="/order/:id" element={<Invoice />} />
      </Routes>
    </Router>
    </>
  )
}

export default App

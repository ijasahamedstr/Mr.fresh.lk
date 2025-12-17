import Header from "./Page/header"
import Home from "./Page/Home";
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
      </Routes>
    </Router>
    </>
  )
}

export default App

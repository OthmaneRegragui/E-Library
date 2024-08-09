import React from 'react'
import {Routes,Route} from "react-router-dom"
import Home from "./pages/Home";
import DetailsBook from "./pages/DetailsBook";
import AddBook from "./pages/AddBook";
import EditBook from "./pages/EditBook";
import BookingBook from "./pages/BookingBook";
import AddUser from "./pages/AddUser";
import EditUser from "./pages/EditUser";

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/books/add/' element={<AddBook />} />
      <Route path='/books/details/:id' element={<DetailsBook />} />
      <Route path='/books/edit/:id' element={<EditBook />} />
      <Route path='/books/booking/:id' element={<BookingBook />} />
      <Route path='/users/add/' element={<AddUser />} />
      <Route path='/users/edit/' element={<EditUser />} />
    </Routes>
  )
}

export default App
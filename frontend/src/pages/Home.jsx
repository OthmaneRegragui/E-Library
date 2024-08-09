import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import moment from 'moment';
import { BsFillPlusSquareFill, BsEyeFill, BsFillPencilFill, BsJournalBookmarkFill } from "react-icons/bs";
import Table from '../components/Table';
import { backEndUrl } from "../config"

const Home = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    axios
      .get(`${backEndUrl}/books`)
      .then((response) => {
        setBooks(response.data.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);



  const columns = [
    { field: '_id', title: 'No' },
    { field: 'title', title: 'Title' },
    { field: 'author', title: 'Author' },
    { field: 'categories', title: 'Categories', render: (book) => book.categories.join(', ') },
    { field: 'publication_date', title: 'Publication Date', render: (book) => moment(book.publication_date).format('YYYY-MM-DD') }, // Custom rendering for date
    { field: 'language', title: 'Language' },
    { field: 'available_copies', title: 'Available Copies' },
    { field: 'total_copies', title: 'Total Copies' },
    { field: 'actions', title: 'Actions', render: (book) => ( // Custom rendering for actions
        <div className="flex justify-center gap-x-4">
          <Link to={`/books/details/${book._id}`}>
            <BsEyeFill className="text-2x1 text-green-800" />
          </Link>
          <Link to={`/books/edit/${book._id}`}>
            <BsFillPencilFill className="text-2x1 text-yellow-500" />
          </Link>
          <Link to={`/books/booking/${book._id}`}>
            <BsJournalBookmarkFill className="text-2x1 text-blue-800" />
          </Link>
        </div>
      )}
    ];





  return (
    <div className="p-4">
      <div className="justify-between items-center">
        <div className="flex justify-between mb-4">
          <h1 className="text-4xl my-8 text-center">Books List</h1>
          <Link to="/books/add/" className="flex items-center text-green-800 hover:text-green-600">
            <BsFillPlusSquareFill className="mr-2 text-4xl" />
            Add New Book
          </Link>
          <Link to="/users/add/" className="flex items-center text-green-800 hover:text-green-600">
            <BsFillPlusSquareFill className="mr-2 text-4xl" />
            Add New User
          </Link>
          <Link to="/users/edit/" className="flex items-center text-green-800 hover:text-green-600">
            <BsFillPencilFill className="mr-2 text-4xl" />
            Edit User
          </Link>
        </div>
            <Table
            data={books}
            columns={columns}
            search={true}
            searchArgs={["title","author","categories","language"]}
            />
      </div>
    </div>
  );
};

export default Home;
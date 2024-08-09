import { Link } from "react-router-dom";
import { BsArrowLeftSquareFill } from "react-icons/bs";

const BackButton = ({destination = '/'}) => {
  return (
    <Link to={destination} className="flex items-center text-green-800 hover:text-green-600">
        <BsArrowLeftSquareFill className="mr-2 text-4xl" />
        Back
    </Link>
  )
}

export default BackButton
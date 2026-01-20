import BorrowList from "./BorrowList";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [borrowList, setBorrowList] = useState([]);

  // GET
  useEffect(() => {
    axios
      .get("http://localhost:3000/borrowList")
      .then((response) => setBorrowList(response.data))
      .catch((err) => console.log(err));
  }, []);

  // POST
  const handleAddBorrow = async (newBorrow) => {
    try {
      const res = await axios.post("http://localhost:3000/borrowList", newBorrow);
      setBorrowList((prev) => [res.data, ...prev]);
    } catch (err) {
      console.log(err);
    }
  };

  // PUT
  const handleEditBorrow = async (id, updatedBorrow) => {
    try {
      const res = await axios.put(
        `http://localhost:3000/borrowList/${id}`,
        updatedBorrow
      );
      setBorrowList((prev) =>
        prev.map((b) => (String(b.id) === String(id) ? res.data : b))
      );
    } catch (err) {
      console.log(err);
    }
  };

  // DELETE
  const handleDeleteBorrow = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/borrowList/${id}`);
      setBorrowList((prev) => prev.filter((b) => String(b.id) !== String(id)));
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <BorrowList
        borrowList={borrowList}
        onAddBorrow={handleAddBorrow}
        onEditBorrow={handleEditBorrow}
        onDeleteBorrow={handleDeleteBorrow}
      />
    </>
  );
}

export default App;

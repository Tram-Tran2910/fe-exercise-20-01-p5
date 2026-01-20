import Dropdown from "react-bootstrap/Dropdown";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Table from "react-bootstrap/Table";
import Modal from "react-bootstrap/Modal";
import { useMemo, useState } from "react";

const emptyForm = {
  bookName: "",
  borrower: "",
  borrowDate: "",
  returnDate: "",
  status: "Chưa trả",
};

function BorrowList({ borrowList = [], onAddBorrow, onEditBorrow, onDeleteBorrow }) {
  const [statusFilter, setStatusFilter] = useState("ALL");

  // modals
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [selected, setSelected] = useState(null);

  // forms
  const [form, setForm] = useState(emptyForm);
  // validate errors
  const [errors, setErrors] = useState({});

  const filteredBorrowList = useMemo(() => {
    if (statusFilter === "ALL") return borrowList;
    return borrowList.filter((b) => b.status === statusFilter);
  }, [borrowList, statusFilter]);

  const openAdd = () => {
    setSelected(null);
    setForm(emptyForm);
    setErrors({});
    setShowAdd(true);
  };
  const closeAdd = () => setShowAdd(false);

  const openEdit = (borrow) => {
    setSelected(borrow);
    setForm({
      bookName: borrow.bookName || "",
      borrower: borrow.borrower || "",
      borrowDate: borrow.borrowDate || "",
      returnDate: borrow.returnDate || "",
      status: borrow.status || "Chưa trả",
    });
    setErrors({});
    setShowEdit(true);
  };
  const closeEdit = () => setShowEdit(false);

  const openDelete = (borrow) => {
    setSelected(borrow);
    setShowDelete(true);
  };
  const closeDelete = () => setShowDelete(false);

  // Validate
  const validate = (data) => {
    const e = {};

    if (!data.bookName?.trim()) e.bookName = "Tên sách không được để trống";
    if (!data.borrower?.trim()) e.borrower = "Tên sinh viên không được để trống";
    if (!data.borrowDate) e.borrowDate = "Vui lòng chọn ngày mượn";

    if (data.borrowDate && data.returnDate) {
      const b = new Date(data.borrowDate);
      const r = new Date(data.returnDate);
      if (r < b) e.returnDate = "Ngày trả phải lớn hơn hoặc bằng ngày mượn";
    }

    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const next = { ...form, [name]: value };
    setForm(next);

    const nextErrors = validate(next);
    setErrors(nextErrors);
  };

  // Add
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate(form);
    setErrors(e2);
    if (Object.keys(e2).length) return;

    await onAddBorrow?.(form);
    closeAdd();
  };

  // Edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selected) return;

    const e2 = validate(form);
    setErrors(e2);
    if (Object.keys(e2).length) return;

    const payload = { ...selected, ...form };
    await onEditBorrow?.(selected.id, payload);
    closeEdit();
  };

  // Delete
  const handleDeleteConfirm = async () => {
    if (!selected) return;
    await onDeleteBorrow?.(selected.id);
    closeDelete();
  };

  // Update Status
  const handleQuickStatusChange = async (borrow, newStatus) => {
    if (borrow.status === newStatus) return;
    const payload = { ...borrow, status: newStatus };
    await onEditBorrow?.(borrow.id, payload);
  };

  const statusVariant = (s) => (s === "Đã trả" ? "success" : "danger");

  return (
    <>
      <h1>Quản lý mượn trả sách</h1>

      <div className="d-flex gap-2 justify-content-end align-items-center mb-3">
        <Dropdown>
          <Dropdown.Toggle variant="outline-primary" id="dropdown-filter">
            {statusFilter === "ALL" ? "Lọc theo trạng thái" : `Trạng thái: ${statusFilter}`}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => setStatusFilter("ALL")}>Tất cả</Dropdown.Item>
            <Dropdown.Item onClick={() => setStatusFilter("Đã trả")}>Đã trả</Dropdown.Item>
            <Dropdown.Item onClick={() => setStatusFilter("Chưa trả")}>Chưa trả</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>

        <Button variant="primary" onClick={openAdd}>
          Thêm thông tin
        </Button>
      </div>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên sách</th>
            <th>Sinh viên mượn</th>
            <th>Ngày mượn</th>
            <th>Ngày trả</th>
            <th>Trạng thái</th>
            <th style={{ width: 180 }}>Chức năng</th>
          </tr>
        </thead>

        <tbody>
          {filteredBorrowList.map((borrow) => (
            <tr key={borrow.id}>
              <td>{borrow.id}</td>
              <td>{borrow.bookName}</td>
              <td>{borrow.borrower}</td>
              <td>{borrow.borrowDate}</td>
              <td>{borrow.returnDate}</td>

              <td>
                <Dropdown>
                  <Dropdown.Toggle
                    size="sm"
                    variant={statusVariant(borrow.status)}
                    id={`status-${borrow.id}`}
                  >
                    {borrow.status}
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item onClick={() => handleQuickStatusChange(borrow, "Chưa trả")}>
                      Chưa trả
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => handleQuickStatusChange(borrow, "Đã trả")}>
                      Đã trả
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </td>

              <td className="d-flex gap-2">
                <Button variant="outline-warning" size="sm" onClick={() => openEdit(borrow)}>
                  Sửa
                </Button>
                <Button variant="outline-danger" size="sm" onClick={() => openDelete(borrow)}>
                  Xóa
                </Button>
              </td>
            </tr>
          ))}

          {filteredBorrowList.length === 0 && (
            <tr>
              <td colSpan={7} className="text-center">
                Không có dữ liệu
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {/* Model Add */}
      <Modal show={showAdd} onHide={closeAdd} centered>
        <Modal.Header closeButton>
          <Modal.Title>Thêm phiếu mượn</Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleAddSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Tên sách</Form.Label>
              <Form.Control
                name="bookName"
                value={form.bookName}
                onChange={handleChange}
                isInvalid={!!errors.bookName}
                placeholder="Nhập tên sách..."
              />
              <Form.Control.Feedback type="invalid">
                {errors.bookName}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Sinh viên mượn</Form.Label>
              <Form.Control
                name="borrower"
                value={form.borrower}
                onChange={handleChange}
                isInvalid={!!errors.borrower}
                placeholder="Nhập tên sinh viên..."
              />
              <Form.Control.Feedback type="invalid">
                {errors.borrower}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ngày mượn</Form.Label>
              <Form.Control
                type="date"
                name="borrowDate"
                value={form.borrowDate}
                onChange={handleChange}
                isInvalid={!!errors.borrowDate}
              />
              <Form.Control.Feedback type="invalid">
                {errors.borrowDate}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ngày trả</Form.Label>
              <Form.Control
                type="date"
                name="returnDate"
                value={form.returnDate}
                onChange={handleChange}
                isInvalid={!!errors.returnDate}
              />
              <Form.Control.Feedback type="invalid">
                {errors.returnDate}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-0">
              <Form.Label>Trạng thái</Form.Label>
              <Form.Select name="status" value={form.status} onChange={handleChange}>
                <option>Chưa trả</option>
                <option>Đã trả</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={closeAdd}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              Lưu
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Modal Edit */}
      <Modal show={showEdit} onHide={closeEdit} centered>
        <Modal.Header closeButton>
          <Modal.Title>Sửa phiếu mượn</Modal.Title>
        </Modal.Header>

        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Tên sách</Form.Label>
              <Form.Control
                name="bookName"
                value={form.bookName}
                onChange={handleChange}
                isInvalid={!!errors.bookName}
              />
              <Form.Control.Feedback type="invalid">
                {errors.bookName}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Sinh viên mượn</Form.Label>
              <Form.Control
                name="borrower"
                value={form.borrower}
                onChange={handleChange}
                isInvalid={!!errors.borrower}
              />
              <Form.Control.Feedback type="invalid">
                {errors.borrower}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ngày mượn</Form.Label>
              <Form.Control
                type="date"
                name="borrowDate"
                value={form.borrowDate}
                onChange={handleChange}
                isInvalid={!!errors.borrowDate}
              />
              <Form.Control.Feedback type="invalid">
                {errors.borrowDate}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Ngày trả</Form.Label>
              <Form.Control
                type="date"
                name="returnDate"
                value={form.returnDate}
                onChange={handleChange}
                isInvalid={!!errors.returnDate}
              />
              <Form.Control.Feedback type="invalid">
                {errors.returnDate}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-0">
              <Form.Label>Trạng thái</Form.Label>
              <Form.Select name="status" value={form.status} onChange={handleChange}>
                <option>Chưa trả</option>
                <option>Đã trả</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={closeEdit}>
              Hủy
            </Button>
            <Button variant="warning" type="submit">
              Cập nhật
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Model Delete */}
      <Modal show={showDelete} onHide={closeDelete} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Bạn có chắc muốn xóa phiếu mượn <strong>{selected?.bookName}</strong> của{" "}
          <strong>{selected?.borrower}</strong> không?
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={closeDelete}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default BorrowList;

import React, { useState } from "react";
import {
  Button,
  Col,
  DatePicker,
  Dropdown,
  Form,
  Input,
  Menu,
  Modal,
  Row,
  Select,
  TimePicker,
} from "antd";
import AxiosInstance from "../../service/AxiosInstance";
import { ToastContainer, toast } from "react-toastify";
import moment from "moment";
import { useEffect } from "react";

const ManualRequestAttendance = ({ items }) => {
  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [attendanceDate, setAttendanceDate] = useState();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [selectReason, setSelectReason] = useState();
  const { Option } = Select;

  const userData = JSON.parse(localStorage.getItem("userdata"));
  console.log(userData, 38);

  const handleClick = (items, key) => {
    if (key == "request") {
      setIsRequestOpen(true);
      setAttendanceDate(items?.date);
    }
  };

  const actionMenu = (items, listAction) => {
    return (
      <>
        {userData[0]?.Shift_type === "4_SAT_OFF" ? (
          <Menu
            items={listAction}
            onClick={(e) => handleClick(items, e.key)}
            disabled={
              moment().diff(items?.date, "days") <= 5
                ? moment(items?.date).format("dddd") === "Sunday"
                  ? true
                  : false
                : true
            }
          />
        ) : (
          <Menu
            items={listAction}
            onClick={(e) => handleClick(items, e.key)}
            disabled={
              moment().diff(items?.date, "days") <= 5
                ? moment(items?.date).format("dddd") === "Saturday" ||
                  moment(items?.date).format("dddd") === "Sunday"
                  ? true
                  : false
                : true
            }
          />
        )}
      </>
    );
  };
  let listAction = [
    {
      key: "request",
      label: "Request for change time",
      items: items,
    },
  ];

  const handleCancel = (errorInfo) => {
    form.resetFields();
    setIsRequestOpen(false);
  };

  const onFinish = (values) => {
    setIsSubmitting(true);
    let dateselected = values?.date;
    let selectedTime = values?.time;
    // selectedTime.month(dateselected)
    selectedTime.date(dateselected.date());
    selectedTime.month(dateselected.month());
    selectedTime.year(dateselected.year());

    const urlencoded = new URLSearchParams();
    urlencoded.append("date", moment(values?.date).format("YYYY-MM-DD"));
    urlencoded.append("type", values?.type);
    urlencoded.append("time", selectedTime);
    urlencoded.append("reason", selectReason);

    AxiosInstance.post("auth/addManualAttendanceRequest", urlencoded).then(
      (res) => {
        setIsRequestOpen(false);
        toast.success("Request created successfully");
        setIsSubmitting(false);
      }
    );
  };

  let data = moment(items?.date).format("MMMM Do YYYY, h:mm:ss a");

  useEffect(() => {
    form.setFieldsValue({
      date:
        attendanceDate &&
        moment(moment(attendanceDate).format("DD/MM/YYYY"), "DD/MM/YYYY"),
    });
  }, [isRequestOpen]);

  return (
    <>
      <Dropdown.Button
        overlay={actionMenu(items, listAction)}
      ></Dropdown.Button>
      {/* Request modal */}
      <Modal
        title="Manual Attendance Request"
        centered
        visible={isRequestOpen}
        //onOk={() => setIsOpenDeleteModal(false)}
        onCancel={handleCancel}
        width={410}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row>
            <Col span={24}>
              <Form.Item
                label="Date"
                name="date"
                rules={[
                  {
                    required: true,
                    message: "Please Select Date",
                  },
                ]}
              >
                <DatePicker format={"DD/MM/YYYY"} />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={24} style={{ paddingRight: "12px" }}>
              <Form.Item
                label="Type"
                name="type"
                rules={[
                  {
                    required: true,
                    message: "Please Select type",
                  },
                ]}
              >
                <Select>
                  <Select.Option value="checkIn">Check In</Select.Option>
                  <Select.Option value="checkOut">Check Out</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={24} style={{ paddingRight: "12px" }}>
              <Form.Item
                label="Time"
                name="time"
                rules={[
                  {
                    required: true,
                    message: "Please Select time",
                  },
                ]}
              >
                <TimePicker />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={24} style={{ paddingRight: "12px" }}>
              <Form.Item
                label="Reason"
                name="reason"
                rules={[
                  {
                    required: true,
                    message: "Please Select Reason",
                  },
                ]}
              >
                <Select
                  onChange={(e) => {
                    setSelectReason(e);
                  }}
                >
                  <Option value="technical issue">Technical Issue</Option>
                  <Option value="Health Issue">Health Issue</Option>
                  <Option value="Vehicle Issue">Vehicle Issue</Option>
                  <Option value="Cricket Tournament">Cricket Tournament</Option>
                  <Option value="Client Meeting">Client Meeting</Option>
                  <Option value="WFH">WFH</Option>
                </Select>
                {/* <Input.TextArea rows={5} maxLength={500} /> */}
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <div style={{ textAlign: "end", marginRight: "10px" }}>
              <Button
                className="pms-same-btn"
                type="primary"
                htmlType="submit"
                // onClick={chackDescription}
                style={{ marginRight: "10px" }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </Button>
              <Button onClick={handleCancel} className="pms-same-btn-cancel">
                Cancel
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>{" "}
    </>
  );
};

export default ManualRequestAttendance;

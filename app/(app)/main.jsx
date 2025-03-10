"use client";

import moment from "moment";
import { useEffect, useRef, useState } from "react";
import Select from "react-select";
import { Button } from "@heroui/button";
import { fetchAllPages } from "@/ultis";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Input } from "@heroui/input";
import MDBReader from "mdb-reader";
import { toUnicode } from "vietnamese-conversion";

const options = [
  { value: "buy", label: "Mua" },
  { value: "sold", label: "Bán" },
];

const options1 = [
  { value: 0, label: "Tất cả" },
  { value: 1, label: "Hoá đơn mới" },
  { value: 2, label: "Hoá đơn thay thế" },
  { value: 3, label: "Hoá đơn điều chỉnh" },
  { value: 4, label: "Hoá đơn đã bị thay thế" },
  { value: 5, label: "Hoá đơn đã bị điều chỉnh" },
  { value: 6, label: "Hoá đơn đã bị huỷ" },
];

const options2 = [
  { value: 99, label: "Tất cả" },
  { value: 0, label: "Tổng cục thuế đã nhận" },
  { value: 1, label: "Đang tiến hành kiểm tra điều kiện cấp mã" },
  { value: 2, label: "CQT từ chối hoá đơn theo từng lần phát sinh" },
  { value: 3, label: "Hoá đơn đủ điều kiện cấp mã" },
  { value: 4, label: "Hoá đơn đủ không đủ điều kiện cấp mã" },
  { value: 5, label: "Đã cấp mã hoá đơn" },
  { value: 6, label: "Tổng cục thuế đã nhận không mã" },
  { value: 7, label: "Đã kiểm tra định kỳ HĐĐT không có mã" },
  {
    value: 8,
    label: "Tổng cục thuế đã nhận hoá đơn có mã khởi tạo từ máy tính tiền",
  },
];

function getMonthsInRange(start, end) {
  let localStart = start.clone();
  let localEnd = end.clone();
  const months = [];

  // Loop through the months between start and end dates
  while (
    localStart.isBefore(localEnd) ||
    localStart.isSame(localEnd, "month")
  ) {
    if (start.month() + 1 === localStart.month() + 1) {
      months.push({
        start: start.format("DD/MM/yyyy"),
        end: start.endOf("month").format("DD/MM/yyyy"),
      }); // Push the month number (1 = January, 12 = December)
      localStart.add(1, "month");
    } else if (localStart.month() + 1 === localEnd.month() + 1) {
      months.push({
        start: localStart.startOf("month").format("DD/MM/yyyy"),
        end: localEnd.format("DD/MM/yyyy"),
      });
      localStart.add(1, "month");
    } else {
      months.push({
        start: localStart.startOf("month").format("DD/MM/yyyy"),
        end: localStart.endOf("month").format("DD/MM/yyyy"),
      });
      localStart.add(1, "month");
    }
  }

  return months;
}

const Main = ({ token }) => {
  const queryClient = useQueryClient();
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [selected, setSelected] = useState({ value: "buy", label: "Mua" });
  const [selected1, setSelected1] = useState({ value: 0, label: "Tất cả" });
  const [selected2, setSelected2] = useState({ value: 99, label: "Tất cả" });
  // const [range, setRange] = useState([]);
  // const [results, setResults] = useState([]);
  const [isEnable, setIsEnable] = useState(false);
  const [password, setPassword] = useState("");
  const [khachHang, setkhachHang] = useState([]);
  const [vatTu, setVatTu] = useState([]);
  const [STT, setSTT] = useState(null);
  const ref = useRef();
  const [file, setFile] = useState(null);

  // const { data, isLoading } = useQuery({
  //   queryKey: ["search", selected.value, start, end],
  //   queryFn: () =>
  //     fetchAllPages(
  //       selected.value,
  //       {
  //         start: `${moment(start).format("DD/MM/yyyy")}T00:00:00`,
  //         end: `${moment(end).format("DD/MM/yyyy")}T23:59:59`,
  //       },
  //       token
  //     ),
  //   enabled: isEnable,
  // });

  const dataQueries = useQueries({
    queries: getMonthsInRange(moment(start), moment(end)).map((item, index) => {
      const dependsOn =
        index > 0
          ? queryClient.getQueryState([
              "search",
              selected.value,
              selected1.value,
              selected2.value,
              getMonthsInRange(moment(start), moment(end))[index - 1],
            ])?.status === "success"
          : null;
      return {
        queryKey: [
          "search",
          selected.value,
          selected1.value,
          selected2.value,
          item,
        ],
        queryFn: () =>
          fetchAllPages(
            selected.value,
            {
              start: `${item.start}T00:00:00`,
              end: `${item.end}T23:59:59`,
              status: selected1.value,
              result: selected2.value,
            },
            token
          ),
        enabled: index === 0 ? isEnable : !!dependsOn && isEnable,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
      };
    }),
  });

  // console.log(dataQueries);

  // useEffect(() => {
  //   if (start && end) {
  //     console.log(getMonthsInRange(moment(start), moment(end)));
  //   }
  // }, [start, end]);

  useEffect(() => {
    if (dataQueries.length > 0 && dataQueries.every((item) => item.isSuccess)) {
      setIsEnable(false);
    }
  }, [dataQueries]);

  useEffect(() => {
    setSelected1({ value: 0, label: "Tất cả" });
    setSelected2({
      value: 99,
      label: "Tất cả",
    });
  }, [selected.value]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFile(file);
  };

  useEffect(() => {
    const load = async () => {
      try {
        // Read the uploaded file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();

        // Initialize the MDBReader
        const reader = new MDBReader(Buffer.from(arrayBuffer), {
          password: password,
        });

        // Get all table names
        // const tables = reader.getTableNames();
        // console.log(tables);

        const socai = reader.getTable("SoCai");
        setSTT(
          socai.getData().reduce((max, num) => {
            return num.RECNO > max ? num.RECNO : max;
          }, -Infinity)
        );

        const khachhang = reader.getTable("KhachHang");
        setkhachHang(
          khachhang.getData().map((item) => ({
            ...item,
            MAKH: toUnicode(item.MAKH, "TCVN3"),
            TENKH: toUnicode(item.TENKH, "TCVN3"),
          }))
        );

        const vattu = reader.getTable("VTHH");
        setVatTu(
          vattu.getData().map((item) => ({
            ...item,
            MAVTHH: toUnicode(item.MAVTHH, "TCVN3"),
            TENVTHH: toUnicode(item.TENVTHH, "TCVN3"),
          }))
        );

        // // Optional: Automatically load data from the first table
        // if (tables.length > 0) {
        //   const table = reader.getTable(tables[0]);
        //   const data = table.getData();
        //   setTableData(data);
        // }
      } catch (error) {
        console.error("Error reading MDB file:", error);
        alert("Failed to read the MDB file. Please try another file.");
      }
    };

    if (file) {
      load();
    }
  }, [file]);

  const exportExcel = async () => {
    const workBook = new ExcelJS.Workbook();

    if (selected.value === "sold") {
      const sheet = workBook.addWorksheet("chitiethoadon");
      sheet.addRow([
        "Ngày hoạch toán (*)",
        "Ngày chứng từ (*)",
        "Số chứng từ (*)",
        "Mẫu số hợp đồng",
        "Ký hiệu hoá đơn",
        "Số hoá đơn",
        "Ngày hoá đơn",
        "Mã khách hàng",
        "Tên khách hàng",
        "Địa chỉ",
        "Mã số thuế",
        "Diễn giải",
        "Mã hàng (*)",
        "Tên hàng",
        "TK Tiền/Chi phí/Nợ (*)",
        "Hình thức thanh toán",
        "ĐVT",
        "Số lượng",
        "Đơn giá",
        "Thành tiền",
        "% thuế GTGT",
        "Tiền thuế GTGT",
        "TK thuế GTGT",
        "Tiền tệ",
        "Tỷ giá",
        "Mã Cơ Quan Thuế",
        "CCCD",
        "Trạng thái hoá đơn",
        "Kết quả kiểm tra",
      ]);
      dataQueries
        .reduce((total, item) => [...total, ...item.data], [])
        .reduce((total, item) => [...total, item.detailInvoices], [])
        .forEach((item) => {
          let ttchung = [
            "",
            "",
            "",
            `${item?.khmshdon}${item?.khhdon}`,
            `${item?.khhdon}`,
            item?.shdon,
            item?.ntao.split("T")[0].split("-").reverse().join("/"),
            "",
            item?.nmten,
            item?.nmdchi,
            item?.nmmst,
          ];

          item.hdhhdvu.forEach((el) => {
            sheet.addRow([
              ...ttchung,
              el?.ten,
              el?.mhhdvu,
              el?.ten,
              "",
              item?.thtttoan,
              el?.dvtinh,
              el?.sluong,
              el?.dgia,
              el?.thtien,
              el.ltsuat
                ? el.ltsuat === "KCT"
                  ? el.ltsuat
                  : el.ltsuat.replace("%", "")
                : "",
              el.ltsuat !== "KCT" && el.ltsuat
                ? parseInt(el.thtien) *
                  (parseInt(el.ltsuat.replace("%", "")) / 100)
                : 0,
              "",
              item?.dvtte,
              item?.tgia,
              item?.mhdon,
              "",
              options1.find((el1) => el1.value === item.tthai).label,
              options2.find((el1) => el1.value === item.ttxly).label,
            ]);
          });
        });

      const buf = await workBook.xlsx.writeBuffer();
      saveAs(new Blob([buf]), `sold-data.xlsx`);
    } else {
      const sheet = workBook.addWorksheet("chitiethoadon");
      sheet.addRow([
        "Mẫu số",
        "KH hoá đơn",
        "Số hoá đơn",
        "Ngày hoá đơn",
        "MST người bán",
        "Tên người bán",
        "Địa chỉ người bán",
        "Mã hàng",
        "Tên hàng",
        "Đơn vị tính",
        "Số lượng",
        "Đơn giá",
        "Tiền hàng chưa thuế",
        // "Loại thuế suất GTGT",
        "Thuế suất",
        "Tiền thuế GTGT",
        "Tổng tiền",
        "Tổng tiền chiết khấu",
        "Tổng tiền phí",
        "Đơn vị tiền tệ",
        "Tỷ giá",
        "Ghi chú",
        "Trạng thái hoá đơn",
        "Kết quả kiểm tra",
      ]);
      dataQueries
        .reduce((total, item) => [...total, ...item.data], [])
        .reduce((total, item) => [...total, item.detailInvoices], [])
        .sort((a, b) => {
          const [d1, m1, y1] = a?.ntao
            .split("T")[0]
            .split("-")
            .reverse()
            .join("/")
            .split("/")
            .map(Number);
          const [d2, m2, y2] = b?.ntao
            .split("T")[0]
            .split("-")
            .reverse()
            .join("/")
            .split("/")
            .map(Number);

          return new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2);
        })
        .forEach((item) => {
          let ttchung = [
            `${item?.khmshdon}`,
            `${item?.khhdon}`,
            item?.shdon,
            item?.ntao.split("T")[0].split("-").reverse().join("/"),
            item?.nbmst,
            item?.nbten,
            item?.nbdchi,
          ];

          item.hdhhdvu.forEach((el) => {
            sheet.addRow([
              ...ttchung,
              el?.mhhdvu,
              el?.ten,
              el?.dvtinh,
              el?.sluong,
              el?.dgia,
              el?.thtien,
              // el.ltsuat,
              el.ltsuat
                ? el.ltsuat === "KCT"
                  ? el.ltsuat
                  : el.ltsuat.replace("%", "")
                : "",
              el.ltsuat !== "KCT" && el.ltsuat
                ? parseInt(el.thtien) *
                  (parseInt(el.ltsuat.replace("%", "")) / 100)
                : 0,
              el.ltsuat !== "KCT" && el.ltsuat
                ? parseInt(el.thtien) +
                  parseInt(el.thtien) *
                    (parseInt(el.ltsuat.replace("%", "")) / 100)
                : el.thtien,
              "",
              "",
              item?.dvtte,
              item?.tgia,
              "",
              options1.find((el1) => el1.value === item.tthai).label,
              options2.find((el1) => el1.value === item.ttxly).label,
            ]);
          });
        });

      const buf = await workBook.xlsx.writeBuffer();
      saveAs(new Blob([buf]), `purchase-data.xlsx`);
    }
  };

  const exportExcelModified = async () => {
    let stt = STT + 1;
    const workBook = new ExcelJS.Workbook();

    const sheet = workBook.addWorksheet("chitiethoadon");

    const khachHangSheet = workBook.addWorksheet("khachhang");

    khachHangSheet.addRow(["Mã KH", "Tên KH"]);
    khachHang.forEach((item) => {
      khachHangSheet.addRow([item.MAKH, item.TENKH]);
    });

    const vatTuSheet = workBook.addWorksheet("vattu");
    vatTuSheet.addRow(["Mã VTHH", "Tên VTHH"]);
    vatTu.forEach((item) => {
      vatTuSheet.addRow([item.MAVTHH, item.TENVTHH]);
    });

    if (selected.value === "buy") {
      let row = [];
      // console.log(1);
      sheet.addRow([
        "Loại CT",
        "Số CT",
        "Ngày CT",
        "TK Nợ",
        "TK Có",
        "TTVND",
        "Diễn giải",
        "ĐT Nợ",
        "ĐT Có",
        "VND Thanh toán",
        "KN",
        "VT-CT Nợ",
        "KX",
        "VT-CT Có",
        "Tên vật tư - Công trình",
        "ĐVT",
        "Số lượng",
        "Chỉ số cũ",
        "Chỉ số mới",
        "ĐG VND",
        "Người giao dịch",
        "Địa chỉ người giao dịch",
        "Ghi chú",
        "Pháp nhân",
        "Địa chỉ pháp nhân",
        "MST",
        "Số TKNH",
        "HTTT",
        "Nhóm hàng",
        "%VAT",
        "%CK",
        "Ký hiệu HĐ",
        "Số HD VAT",
        "Ngày VAT",
        "Nghiệp vụ thu",
        "Nhóm HĐ",
        "STT",
        "Ngày VS",
        "User nhập",
        "User khoá",
      ]);

      dataQueries
        .reduce((total, item) => [...total, ...item.data], [])
        .reduce((total, item) => [...total, item.detailInvoices], [])
        .sort((a, b) => {
          const [d1, m1, y1] = a?.ntao
            .split("T")[0]
            .split("-")
            .reverse()
            .join("/")
            .split("/")
            .map(Number);
          const [d2, m2, y2] = b?.ntao
            .split("T")[0]
            .split("-")
            .reverse()
            .join("/")
            .split("/")
            .map(Number);

          return new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2);
        })
        .forEach((item) => {
          // let thueRow;
          item.hdhhdvu.forEach((el) => {
            row.push([
              "PKT",
              item?.shdon,
              item?.ntao.split("T")[0].split("-").reverse().join("/"),
              "156",
              "331",
              el?.thtien,
              `Mua ${el?.ten}`,
              "",
              khachHang.find(
                (el1) => el1.TENKH.toLowerCase() === item?.nbten.toLowerCase()
              )?.MAKH,
              "",
              "1",
              vatTu.find(
                (el1) => el1.TENVTHH.toLowerCase() === el?.ten.toLowerCase()
              )?.MAVTHH,
              "",
              "",
              el?.ten,
              el?.dvtinh,
              el?.sluong,
              "",
              "",
              el?.dgia,
              item?.nbten,
              item?.nbdchi,
              "",
              item?.nbten,
              item?.nbdchi,
              item?.nbmst,
              "",
              "",
              el?.ten,
              el.ltsuat
                ? el.ltsuat === "KCT"
                  ? el.ltsuat
                  : el.ltsuat.replace("%", "")
                : "",
              el?.tlckhau,
              item?.khhdon,
              item?.shdon,
              item?.ntao.split("T")[0].split("-").reverse().join("/"),
              "A2",
              "1",
              "",
              moment().format("DD/MM/yyy"),
              "ADM",
              "",
            ]);

            // row.push([
            //   "PKT",
            //   item?.shdon,
            //   item?.ntao.split("T")[0].split("-").reverse().join("/"),
            //   "156",
            //   "331",
            //   "",
            //   `Mua ${el?.ten}`,
            //   "",
            //   khachHang.find((el1) => el1.TENKH === item?.nbten)?.MAKH,
            //   "",
            //   "1",
            //   vatTu.find((el1) => el1.TENVTHH === el?.ten)?.MAVTHH,
            //   "",
            //   "",
            //   el?.ten,
            //   el?.dvtinh,
            //   el?.sluong,
            //   "",
            //   "",
            //   "",
            //   item?.nbten,
            //   item?.nbdchi,
            //   "",
            //   item?.nbten,
            //   item?.nbdchi,
            //   item?.nbmst,
            //   "",
            //   "",
            //   el?.ten,
            //   el.ltsuat
            //     ? el.ltsuat === "KCT"
            //       ? el.ltsuat
            //       : el.ltsuat.replace("%", "")
            //     : "",
            //   el?.tlckhau,
            //   item?.khhdon,
            //   item?.shdon,
            //   item?.ntao.split("T")[0].split("-").reverse().join("/"),
            //   "A2",
            //   "1",
            //   "",
            //   moment().format("DD/MM/yyy"),
            //   "ADM",
            //   "",
            // ]);
          });
          // stt = stt + 3;
          // console.log(stt);
          row.push([
            "PKT",
            item?.shdon,
            item?.ntao.split("T")[0].split("-").reverse().join("/"),
            "1331",
            "331",
            item?.thttltsuat[0]?.tthue,
            "Thuế GTGT",
            "",
            khachHang.find(
              (el1) => el1.TENKH.toLowerCase() === item?.nbten.toLowerCase()
            )?.MAKH,
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            item?.nbten,
            item?.nbdchi,
            "",
            item?.nbten,
            item?.nbdchi,
            item?.nbmst,
            "",
            "",
            "",
            item?.thttltsuat[0]?.tsuat
              ? item?.thttltsuat[0]?.tsuat === "KCT"
                ? item?.thttltsuat[0]?.tsuat
                : item?.thttltsuat[0]?.tsuat.replace("%", "")
              : "",
            "",
            item?.khhdon,
            item?.shdon,
            item?.ntao.split("T")[0].split("-").reverse().join("/"),
            "A2",
            "1",
            "",
            moment().format("DD/MM/yyy"),
            "ADM",
            "",
          ]);
        });

      row
        .map((item, i) => {
          item[36] = stt + i;
          return item;
        })
        .forEach((item) => sheet.addRow(item));
      setSTT(stt + row.length - 1);
      const buf = await workBook.xlsx.writeBuffer();
      saveAs(new Blob([buf]), `purchase-dataModified.xlsx`);
      ref.current.value = "";
      setFile(null);
    } else {
      let row = [];
      // let middleSTT = stt;
      // const sheet = workBook.addWorksheet("chitiethoadon");
      sheet.addRow([
        "Loại CT",
        "Số CT",
        "Ngày CT",
        "TK Nợ",
        "TK Có",
        "TTVND",
        "Diễn giải",
        "ĐT Nợ",
        "ĐT Có",
        "VND Thanh toán",
        "KN",
        "VT-CT Nợ",
        "KX",
        "VT-CT Có",
        "Tên vật tư - Công trình",
        "ĐVT",
        "Số lượng",
        "Chỉ số cũ",
        "Chỉ số mới",
        "ĐG VND",
        "Người giao dịch",
        "Địa chỉ người giao dịch",
        "Ghi chú",
        "Pháp nhân",
        "Địa chỉ pháp nhân",
        "MST",
        "Số TKNH",
        "HTTT",
        "Nhóm hàng",
        "%VAT",
        "%CK",
        "Ký hiệu HĐ",
        "Số HD VAT",
        "Ngày VAT",
        "Nghiệp vụ thu",
        "Nhóm HĐ",
        "STT",
        "Ngày VS",
        "User nhập",
        "User khoá",
      ]);

      dataQueries
        .reduce((total, item) => [...total, ...item.data], [])
        .reduce((total, item) => {
          if (total.some((el) => el.mhdon === item.mhdon)) return total;
          return [...total, item];
        }, [])
        .reduce((total, item) => [...total, item.detailInvoices], [])
        .sort((a, b) => {
          const [d1, m1, y1] = a?.ntao
            .split("T")[0]
            .split("-")
            .reverse()
            .join("/")
            .split("/")
            .map(Number);
          const [d2, m2, y2] = b?.ntao
            .split("T")[0]
            .split("-")
            .reverse()
            .join("/")
            .split("/")
            .map(Number);

          return (
            new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2) ||
            a.shdon - b.shdon
          );
        })
        .forEach((item) => {
          let thueRow = [];
          item.hdhhdvu.forEach((el) => {
            row.push([
              "HD",
              item?.shdon,
              item?.ntao.split("T")[0].split("-").reverse().join("/"),
              "131",
              "5111",
              el?.thtien,
              `Bán ${el?.ten}`,
              khachHang.find(
                (el1) => el1.TENKH.toLowerCase() === item?.nmten.toLowerCase()
              )?.MAKH,
              "",
              "",
              "",
              "",
              "1",
              vatTu.find(
                (el1) => el1.TENVTHH.toLowerCase() === el?.ten.toLowerCase()
              )?.MAVTHH,
              el?.ten,
              el?.dvtinh,
              el?.sluong,
              "",
              "",
              el?.dgia,
              item?.nmten,
              item?.nmdchi,
              "",
              item?.nmten,
              item?.nmdchi,
              item?.nmmst,
              "",
              "",
              el?.ten,
              el.ltsuat
                ? el.ltsuat === "KCT"
                  ? el.ltsuat
                  : el.ltsuat.replace("%", "")
                : "",
              el?.tlckhau,
              item?.khhdon,
              item?.shdon,
              item?.ntao.split("T")[0].split("-").reverse().join("/"),
              "A1",
              "1",
              "",
              moment().format("DD/MM/yyy"),
              "ADM",
              "",
            ]);

            row.push([
              "TDXK",
              item?.shdon,
              item?.ntao.split("T")[0].split("-").reverse().join("/"),
              "632",
              "156",
              "",
              `Bán ${el?.ten}`,
              "",
              "",
              "",
              "",
              "",
              "1",
              vatTu.find(
                (el1) => el1.TENVTHH.toLowerCase() === el?.ten.toLowerCase()
              )?.MAVTHH,
              el?.ten,
              el?.dvtinh,
              el?.sluong,
              "",
              "",
              "",
              item?.nmten,
              item?.nmdchi,
              "",
              item?.nmten,
              item?.nmdchi,
              item?.nmmst,
              "",
              "",
              el?.ten,
              el.ltsuat
                ? el.ltsuat === "KCT"
                  ? el.ltsuat
                  : el.ltsuat.replace("%", "")
                : "",
              el?.tlckhau,
              item?.khhdon,
              item?.shdon,
              item?.ntao.split("T")[0].split("-").reverse().join("/"),
              "A1",
              "1",
              "",
              moment().format("DD/MM/yyy"),
              "ADM",
              "",
            ]);

            thueRow = [
              ...thueRow,
              [
                "HD",
                item?.shdon,
                item?.ntao.split("T")[0].split("-").reverse().join("/"),
                "131",
                "33311",
                el.ltsuat !== "KCT" && el.ltsuat
                  ? parseInt(el.thtien) *
                    (parseInt(el.ltsuat.replace("%", "")) / 100)
                  : 0,
                "Thuế GTGT",
                khachHang.find(
                  (el1) => el1.TENKH.toLowerCase() === item?.nmten.toLowerCase()
                )?.MAKH,
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                "",
                item?.nmten,
                item?.nmdchi,
                "",
                item?.nmten,
                item?.nmdchi,
                item?.nmmst,
                "",
                "",
                "",
                el.ltsuat
                  ? el.ltsuat === "KCT"
                    ? el.ltsuat
                    : el.ltsuat.replace("%", "")
                  : "",
                "",
                item?.khhdon,
                item?.shdon,
                item?.ntao.split("T")[0].split("-").reverse().join("/"),
                "A1",
                "1",
                "",
                moment().format("DD/MM/yyy"),
                "ADM",
                "",
              ],
            ];
          });

          if (
            item.hdhhdvu.every((el) => el.ltsuat === item.hdhhdvu[0].ltsuat)
          ) {
            row.push([
              "HD",
              item?.shdon,
              item?.ntao.split("T")[0].split("-").reverse().join("/"),
              "131",
              "33311",
              item?.thttltsuat[0]?.tthue,
              "Thuế GTGT",
              khachHang.find(
                (el1) => el1.TENKH.toLowerCase() === item?.nmten.toLowerCase()
              )?.MAKH,
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              "",
              item?.nmten,
              item?.nmdchi,
              "",
              item?.nmten,
              item?.nmdchi,
              item?.nmmst,
              "",
              "",
              "",
              item?.thttltsuat[0]?.tsuat
                ? item?.thttltsuat[0]?.tsuat === "KCT"
                  ? item?.thttltsuat[0]?.tsuat
                  : item?.thttltsuat[0]?.tsuat.replace("%", "")
                : "",
              "",
              item?.khhdon,
              item?.shdon,
              item?.ntao.split("T")[0].split("-").reverse().join("/"),
              "A1",
              "1",
              "",
              moment().format("DD/MM/yyy"),
              "ADM",
              "",
            ]);
          } else {
            row = [...row, ...thueRow];
          }
        });
      row
        .map((item, i) => {
          item[36] = stt + i;
          return item;
        })
        .forEach((item) => sheet.addRow(item));
      setSTT(stt + row.length - 1);
      const buf = await workBook.xlsx.writeBuffer();
      saveAs(new Blob([buf]), `sold-dataModified.xlsx`);
      ref.current.value = "";
      setFile(null);
    }
  };

  // console.log(STT);

  const handleOnClick = () => {
    setIsEnable(true);
  };

  return (
    <div className=" w-[100vw] h-[100vh] align-middle flex flex-col p-4 gap-2 justify-center items-center">
      <div className="flex gap-2">
        <h6>Từ ngày:</h6>
        <input
          className="boder border-1"
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
      </div>
      <div className="flex gap-2 ">
        <h6>Đến ngày:</h6>
        <input
          className="boder border-1"
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />
      </div>
      <div className="flex gap-2  items-center">
        <h6>Hoá đơn điện tử:</h6>
        <Select
          options={options}
          value={selected}
          onChange={setSelected}
          className="w-[200px]"
        />
      </div>
      <div className="flex gap-2 items-center">
        <h6>Trạng thái hoá đơn:</h6>
        <Select
          options={options1}
          value={selected1}
          onChange={setSelected1}
          className="w-[200px]"
        />
      </div>

      <div className="flex gap-2 items-center">
        <h6>Kết quả kiểm tra:</h6>
        <Select
          options={
            selected.value === "buy"
              ? options2.filter(
                  (item) =>
                    item.value === 5 ||
                    item.value === 6 ||
                    item.value === 8 ||
                    item.value === 99
                )
              : options2
          }
          value={selected2}
          onChange={setSelected2}
          className="w-[200px]"
        />
      </div>
      <div className="flex gap-2 items-center">
        <h6 className="w-fit">Mật khẩu file Access:</h6>
        <Input type="password" value={password} onValueChange={setPassword} />
      </div>
      <div className="flex gap-2 items-center">
        <h6 className="w-fit">File Access:</h6>
        <Input
          ref={ref}
          type="file"
          accept=".mdb,.accdb"
          onChange={handleFileUpload}
          isDisabled={!password}
        />
      </div>

      <div className="flex gap-2">
        <Button
          className="w-fit"
          color="primary"
          isLoading={dataQueries.some((item) => item.isLoading)}
          isDisabled={
            !start || !end || dataQueries.some((item) => item.isLoading)
          }
          onPress={handleOnClick}
        >
          Tìm kiếm
        </Button>
        <Button
          className="w-fit"
          color="primary"
          isDisabled={
            dataQueries.length === 0 ||
            dataQueries.every((item) => !item.isSuccess) ||
            dataQueries.some((item) => item.isLoading)
          }
          onPress={() => exportExcel()}
        >
          Xuất Excel
        </Button>
        <Button
          className="w-fit"
          color="primary"
          isDisabled={
            dataQueries.length === 0 ||
            !file ||
            khachHang.length === 0 ||
            vatTu.length === 0 ||
            STT === null ||
            dataQueries.every((item) => !item.isSuccess) ||
            dataQueries.some((item) => item.isLoading)
          }
          onPress={() => exportExcelModified()}
        >
          Xuất Excel Modified
        </Button>
      </div>
    </div>
  );
};

export default Main;

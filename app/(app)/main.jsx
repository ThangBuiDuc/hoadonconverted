"use client";

import moment from "moment";
import { useEffect, useState } from "react";
import Select from "react-select";
import { Button } from "@nextui-org/button";
import { fetchAllPages } from "@/ultis";
import { useQueries, useQueryClient } from "@tanstack/react-query";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

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
    if (selected.value === "buy") {
      setSelected2({ value: 5, label: "Đã cấp mã hoá đơn" });
    } else {
      setSelected2({
        value: 99,
        label: "Tất cả",
      });
    }
  }, [selected.value]);

  const exportExcel = async () => {
    const workBook = new ExcelJS.Workbook();
    // const workSheet = workBook.addWorksheet("hoadon");
    // workSheet.addRow([""]);
    // workSheet.addRow([""]);
    // workSheet.addRow(["DANH SÁCH HOÁ ĐƠN"]);
    // // workSheet.getCell('A3').style({})
    // workSheet.mergeCells("A3", "Q3");
    // workSheet.addRow([
    //   `Từ ngày ${moment(start).format("DD/MM/yyyy")} đến ngày ${moment(
    //     end
    //   ).format("DD/MM/yyyy")}`,
    // ]);
    // workSheet.mergeCells("A4", "Q4");
    // workSheet.addRow([
    //   "STT",
    //   "Ký hiệu mẫu số",
    //   "Ký hiệu hoá đơn",
    //   "Số hoá đơn",
    //   "Ngày lập",
    //   `${
    //     selected.value === "sold"
    //       ? "MST người mua/MST người nhận hàng"
    //       : "MST người bán/MST người xuất hàng"
    //   }`,
    //   `${
    //     selected.value === "sold"
    //       ? "Tên người mua/Tên người nhận hàng"
    //       : "Tên người bán/Tên người xuất hàng"
    //   }`,

    //   "Tổng tiền chưa thuế",
    //   "Tổng tiền thuế",
    //   "Tổng tiền chiết khấu thương mại",
    //   "Tổng tiền phí",
    //   "Tổng tiền thanh toán",
    //   "Đơn vị tiền tệ",
    //   "Tỷ giá",
    //   "Trạng thái hóa đơn",
    //   "Kết quả kiểm tra hóa đơn",
    // ]);
    // dataQueries
    //   .reduce((total, item) => [...total, ...item.data], [])
    //   .forEach((item, index) => {
    //     workSheet.addRow([
    //       index + 1,
    //       item.khmshdon,
    //       item.khhdon,
    //       item.shdon,
    //       item.ntao.split("T")[0].split("-").reverse().join("/"),
    //       selected.value === "buy" ? item.nbmst : item.nmmst,
    //       selected.value === "buy" ? item.nbten : item.nmten,
    //       // selected.value === "buy" ? item.nbdchi : item.nmdchi,
    //       item.tgtcthue,
    //       item.tgtthue,
    //       item.tgtkhac,
    //       item.tgtphi,
    //       item.tgtttbso,
    //       item.dvtte,
    //       item.tgia,
    //     ]);
    //   });

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
      saveAs(new Blob([buf]), `data.xlsx`);
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
      saveAs(new Blob([buf]), `data.xlsx`);
    }
  };

  const handleOnClick = async () => {
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
                    item.value === 5 || item.value === 6 || item.value === 8
                )
              : options2
          }
          value={selected2}
          onChange={setSelected2}
          className="w-[200px]"
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
      </div>
    </div>
  );
};

export default Main;

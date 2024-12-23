"use client";

import moment from "moment";
import { useEffect, useState } from "react";
import Select from "react-select";
import { Button } from "@nextui-org/button";
import { fetchAllPages } from "@/ultis";
import { useQueries } from "@tanstack/react-query";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const options = [
  { value: "buy", label: "Mua" },
  { value: "sold", label: "Bán" },
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
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [selected, setSelected] = useState({ value: "buy", label: "Mua" });
  const [range, setRange] = useState([]);
  const [results, setResults] = useState([]);
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
    queries: getMonthsInRange(moment(start), moment(end)).map((item) => ({
      queryKey: ["search", selected.value, item],
      queryFn: () =>
        fetchAllPages(
          selected.value,
          {
            start: `${item.start}T00:00:00`,
            end: `${item.end}T23:59:59`,
          },
          token
        ),
      enabled: isEnable,
    })),
  });

  console.log(dataQueries);

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

  const exportExcel = async () => {
    const workBook = new ExcelJS.Workbook();
    const workSheet = workBook.addWorksheet("hoadon");
    workSheet.addRow([""]);
    workSheet.addRow([""]);
    workSheet.addRow(["DANH SÁCH HOÁ ĐƠN"]);
    // workSheet.getCell('A3').style({})
    workSheet.mergeCells("A3", "Q3");
    workSheet.addRow([
      `Từ ngày ${moment(start).format("DD/MM/yyyy")} đến ngày ${moment(
        end
      ).format("DD/MM/yyyy")}`,
    ]);
    workSheet.mergeCells("A4", "Q4");
    workSheet.addRow([
      "STT",
      "Ký hiệu mẫu số",
      "Ký hiệu hoá đơn",
      "Số hoá đơn",
      "Ngày lập",
      `${
        selected.value === "sold"
          ? "MST người mua/MST người nhận hàng"
          : "MST người bán/MST người xuất hàng"
      }`,
      `${
        selected.value === "sold"
          ? "Tên người mua/Tên người nhận hàng"
          : "Tên người bán/Tên người xuất hàng"
      }`,

      "Tổng tiền chưa thuế",
      "Tổng tiền thuế",
      "Tổng tiền chiết khấu thương mại",
      "Tổng tiền phí",
      "Tổng tiền thanh toán",
      "Đơn vị tiền tệ",
      "Tỷ giá",
      "Trạng thái hóa đơn",
      "Kết quả kiểm tra hóa đơn",
    ]);
    dataQueries
      .reduce((total, item) => [...total, ...item.data], [])
      .forEach((item, index) => {
        workSheet.addRow([
          index + 1,
          item.khmshdon,
          item.khhdon,
          item.shdon,
          item.ntao.split("T")[0].split("-").reverse().join("/"),
          selected.value === "buy" ? item.nbmst : item.nmmst,
          selected.value === "buy" ? item.nbten : item.nmten,
          // selected.value === "buy" ? item.nbdchi : item.nmdchi,
          item.tgtcthue,
          item.tgtthue,
          item.tgtkhac,
          item.tgtphi,
          item.tgtttbso,
          item.dvtte,
          item.tgia,
        ]);
      });

    const sheet = workBook.addWorksheet("chitiethoadon");
    sheet.addRow([
      "Ký hiệu hoá đơn",
      "Số hoá đơn",
      "Ngày lập hoá đơn",
      "Đơn vị tiền tệ",
      "Tỷ giá",
      "Tên nhà cung cấp",
      "Mã số thuế người bán",
      "Ngày ký số người bán",
      "Mã CQT",
      "Ngày cấp mã CQT",
      "Tên người mua",
      "Mã số thuế người mua",
      "Số thứ tự",
      "Mã HHDV",
      "Tên HHDV",
      "Đơn vị tính",
      "Số lượng",
      "Đơn giá",
      "Tỷ lệ chiết khấu",
      "Số tiền chiết khấu",
      "Tổng tiền",
      "Thuế suất",
      "Tiền thuế",
      "Thành tiền",
    ]);
    dataQueries
      .reduce((total, item) => [...total, ...item.data], [])
      .reduce((total, item) => [...total, item.detailInvoices], [])
      .forEach((item) => {
        let ttchung = [
          `${item.khmshdon}${item.khhdon}`,
          item.shdon,
          item.ntao.split("T")[0].split("-").reverse().join("/"),
          item.dvtte,
          item.tgia,
          item.nbten,
          item.nbmst,
          JSON.parse(item.nbcks)
            .SigningTime.split("T")[0]
            .split("-")
            .reverse()
            .join("/"),
          item.cqt,
          "",
          item.nmten,
          item.nmmst,
        ];

        item.hdhhdvu.forEach((el) => {
          sheet.addRow([
            ...ttchung,
            el.stt,
            el?.mhhdvu,
            el.ten,
            el.dvtinh,
            el.sluong,
            el.dgia,
            el.tlckhau,
            el.stckhau,
            el.thtien,
            el.tsuat,
            el.ttkhac.find((element) => element.ttruong === "VATAmount").dlieu,
            parseFloat(
              el.ttkhac.find((element) => element.ttruong === "VATAmount").dlieu
            ) + parseFloat(el.thtien),
          ]);
        });
      });

    const buf = await workBook.xlsx.writeBuffer();
    saveAs(new Blob([buf]), `data.xlsx`);
  };

  const handleOnClick = async () => {
    setIsEnable(true);
  };

  return (
    <div className="flex flex-col p-4 gap-2">
      <div className="flex gap-2">
        <h6>Từ ngày:</h6>
        <input
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <h6>Đến ngày:</h6>
        <input
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />
      </div>
      <Select
        options={options}
        value={selected}
        onChange={setSelected}
        className="w-[200px]"
      />
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
          dataQueries.every((item) => !item.isSuccess)
        }
        onPress={() => exportExcel()}
      >
        Xuất Excel
      </Button>
    </div>
  );
};

export default Main;

"use client";

import moment from "moment";
import { useEffect, useState } from "react";
import Select from "react-select";
import { Button } from "@nextui-org/button";
import { apiSearch } from "@/ultis";

const options = [
  { value: "buy", label: "Mua" },
  { value: "sold", label: "Bán" },
];

function getMonthsInRange(start, end) {
  const months = [];

  // Loop through the months between start and end dates
  while (start.isBefore(end) || start.isSame(end, "month")) {
    months.push(start.month() + 1); // Push the month number (1 = January, 12 = December)
    start.add(1, "month");
  }

  return months;
}

const Main = ({ token }) => {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [selected, setSelected] = useState({ value: "buy", label: "Mua" });
  const [range, setRange] = useState([]);
  const [results, setResults] = useState([]);

  //   useEffect(() => {
  //     if (start && end) {
  //       console.log(getMonthsInRange(moment(start), moment(end)));
  //       getMonthsInRange(moment(start), moment(end)).map((item) => {
  //         console.log(moment().month(item).startOf("month"));
  //         if (moment(start).month() + 1 == item) {
  //           setRange((pre) => [
  //             ...pre,
  //             {
  //               start: moment(start).format("DD/MM/yyyy"),
  //               end: moment(start).endOf("month").format("DD/MM/yyyy"),
  //             },
  //           ]);
  //         } else if (moment(end).month() + 1 == item) {
  //           setRange((pre) => [
  //             ...pre,
  //             {
  //               start: moment().month(item).startOf("month").format("DD/MM/yyyy"),
  //               end: moment(end).format("DD/MM/yyyy"),
  //             },
  //           ]);
  //         }
  //       });
  //     }
  //   }, [start, end]);

  //   console.log(range);

  const handleOnClick = async () => {
    const res = await apiSearch(
      selected.value,
      {
        start: `${moment(start).format("DD/MM/yyyy")}T00:00:00`,
        end: `${moment(end).format("DD/MM/yyyy")}T23:59:59`,
      },
      token
    );

    console.log(res);
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
        isDisabled={!start || !end}
        onPress={handleOnClick}
      >
        Tìm kiếm
      </Button>
    </div>
  );
};

export default Main;

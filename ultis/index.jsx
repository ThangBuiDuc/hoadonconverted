import axios from "axios";
import https from "https";
export const dynamic = "force-dynamic";

export const getCaptcha = async () => {
  const agent = new https.Agent({
    rejectUnauthorized: false, // Disable SSL certificate verification
  });

  const res = await axios.get(process.env.NEXT_PUBLIC_API_GET_CAPTCHA, {
    httpsAgent: agent,
  });
  //   console.log(process.env.NEXT_PUBLIC_API_GET_CAPTCHA);
  //   const res = await axios({
  //     url: process.env.NEXT_PUBLIC_API_GET_CAPTCHA,
  //     method: "get",
  //     headers: {
  //       "content-type": "Application/json",
  //     },
  //   });
  //   console.log(res);
  return res;
};

export const apiLogIn = async (data) => {
  //   console.log(process.env.NEXT_PUBLIC_API_GET_CAPTCHA);
  const res = await axios({
    url: process.env.NEXT_PUBLIC_API_LOG_IN,
    method: "POST",
    data,
    headers: {
      "content-type": "Application/json",
    },
  });
  return res.data;
};

export const apiSearch = async (type, data, token) => {
  const agent = new https.Agent({
    rejectUnauthorized: false, // Disable SSL certificate verification
  });

  //   const res = await axios.get(process.env.NEXT_PUBLIC_API_GET_CAPTCHA, {
  //     httpsAgent: agent,
  //   });

  //   console.log(process.env.NEXT_PUBLIC_API_GET_CAPTCHA);
  const res = await axios({
    url: `${process.env.NEXT_PUBLIC_API_SEARCH}/${
      type === "buy" ? "purchase" : "sold"
    }?sort=tdlap:desc,khmshdon:asc,shdon:desc&size=50&search=tdlap=ge=${
      data.start
    };tdlap=le=${data.end}`,
    method: "GET",
    headers: {
      "content-type": "Application/json",
      Authorization: "Bearer " + token,
    },
    httpsAgent: agent,
  });

  return res.data;
};

export const apiDetailInvoices = async (data, token) => {
  const agent = new https.Agent({
    rejectUnauthorized: false, // Disable SSL certificate verification
  });

  //   const res = await axios.get(process.env.NEXT_PUBLIC_API_GET_CAPTCHA, {
  //     httpsAgent: agent,
  //   });

  //   console.log(process.env.NEXT_PUBLIC_API_GET_CAPTCHA);
  const res = await axios({
    url: `${process.env.NEXT_PUBLIC_API_SEARCH}/detail?nbmst=${data.nbmst}&khhdon=${data.khhdon}&shdon=${data.shdon}&khmshdon=${data.khmshdon}`,
    method: "GET",
    headers: {
      "content-type": "Application/json",
      Authorization: "Bearer " + token,
    },
    httpsAgent: agent,
  });

  return res.data;
};

export async function fetchAllPages(type, data, token) {
  const agent = new https.Agent({
    rejectUnauthorized: false, // Disable SSL certificate verification
  });
  const allData = [];
  let page = 1;
  let state = true;
  // Helper function for delay
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Helper function to generate a random delay
  // const randomDelay = (minMs, maxMs) =>
  //   Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;

  while (state) {
    try {
      await delay(page * 2000);
      // Send GET request with axios, including pagination details
      const response = await axios({
        url: `${process.env.NEXT_PUBLIC_API_SEARCH}/${
          type === "buy" ? "purchase" : "sold"
        }?sort=tdlap:desc,khmshdon:asc,shdon:desc&size=50&search=tdlap=ge=${
          data.start
        };tdlap=le=${data.end}${
          data.status === 0 ? "" : `;tthai==${data.status}`
        }${data.result === 99 ? "" : `;ttxly==${data.result}`}${
          page > 1 ? `&state=${state}` : ""
        }`,
        method: "GET",
        headers: {
          "content-type": "Application/json",
          Authorization: "Bearer " + token,
        },
        httpsAgent: agent,
      });

      const pageData = response.data.datas;

      const processedItems = await Promise.all(
        pageData.map(async (item, index) => {
          try {
            await delay(index * 2000);
            const processResponse = await apiDetailInvoices(item, token);
            return { ...item, detailInvoices: processResponse };
          } catch (error) {
            console.error("Error processing item:", item.id, error.message);
            return { ...item, detailInvoices: null }; // Fallback in case of error
          }
        })
      );

      // Append current page data to allData
      allData.push(...processedItems); // Adjust `items` to match the API's data structure

      // Check if there's more data
      state = pageData.state;
      if (state) page += 1; // Adjust this condition based on the API's response
    } catch (error) {
      console.error("Error fetching data:", error.message);
      hasMoreData = false; // Stop fetching on error
    }
  }

  return allData;
}

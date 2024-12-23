import axios from "axios";
import https from "https";

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

export async function fetchAllPages(type, data, token) {
  const agent = new https.Agent({
    rejectUnauthorized: false, // Disable SSL certificate verification
  });
  const allData = [];
  let page = 1;
  let state = true;

  while (state) {
    try {
      // Send GET request with axios, including pagination details
      const response = await axios({
        url: `${process.env.NEXT_PUBLIC_API_SEARCH}/${
          type === "buy" ? "purchase" : "sold"
        }?sort=tdlap:desc,khmshdon:asc,shdon:desc&size=50&search=tdlap=ge=${
          data.start
        };tdlap=le=${data.end};ttxly==5${page > 1 ? `&state=${state}` : ""}`,
        method: "GET",
        headers: {
          "content-type": "Application/json",
          Authorization: "Bearer " + token,
        },
        httpsAgent: agent,
      });

      const pageData = response.data;

      // Append current page data to allData
      allData.push(...pageData.datas); // Adjust `items` to match the API's data structure

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

"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import SignIn from "./signIn";
const Main = dynamic(() => import("./main"), { ssr: false });

const Content = ({ captchaData }) => {
  const [key, SetKey] = useState("");
  const [isVerify, setIsVerify] = useState(false);
  const [token, setToken] = useState(
    "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIwMjAwOTA2MDQ5IiwidHlwZSI6MiwiZXhwIjoxNzM2MDAxMDg1LCJpYXQiOjE3MzU5MTQ2ODV9.spGX2cBY_UY3jPqxFAiEQh-YfcQFDSiKq5vEYm-VE9EX7zj4GxLmK339pbDY8vnyFUHJANZ_DUwBtxtX_wJMSw"
  );

  const verify = (e) => {
    e.preventDefault();
    if (1) {
      setIsVerify(true);
    }
  };

  //   console.log(captchaData);
  return (
    <div>
      {!isVerify ? (
        <div className="flex justify-center h-[100vh] w-[100vw] items-center">
          <div className="w-80 rounded-lg shadow h-auto p-6 bg-white relative overflow-hidden">
            <div className="flex flex-col justify-center items-center space-y-2">
              <h2 className="text-2xl font-medium text-slate-700">
                Nhập Mã Khoá
              </h2>
            </div>
            <form
              className="w-full mt-4 space-y-3 justify-center flex flex-col"
              onSubmit={verify}
            >
              <div>
                <input
                  value={key}
                  onChange={(e) => {
                    SetKey(e.target.value);
                  }}
                  className="outline-none border-2 rounded-md px-2 py-1 text-slate-500 w-full focus:border-blue-300"
                  placeholder="Mã khoá"
                  type="text"
                />
              </div>
              <button
                className="w-full justify-center py-1 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 rounded-md text-white ring-2"
                id="login"
                name="login"
                type="submit"
              >
                Nhập
              </button>
            </form>
          </div>
        </div>
      ) : token ? (
        <Main token={token} />
      ) : (
        <SignIn captchaData={captchaData} setToken={setToken} />
      )}
    </div>
  );
};

export default Content;

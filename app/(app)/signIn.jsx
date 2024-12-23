import { apiLogIn } from "@/ultis";
import React, { useCallback, useState } from "react";

const SignIn = ({ setToken, captchaData }) => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");

  const logIn = async (e) => {
    e.preventDefault();
    const res = await apiLogIn({
      ckey: captchaData.key,
      cvalue: captcha,
      password: password,
      username: userName,
    });
    setToken(res.token);
  };

  return (
    <div className="flex justify-center h-[100vh] w-[100vw] items-center">
      {" "}
      <div className="w-80 rounded-lg shadow h-auto p-6 bg-white relative overflow-hidden">
        <div className="flex flex-col justify-center items-center space-y-2">
          <h2 className="text-2xl font-medium text-slate-700">Đăng nhập</h2>
        </div>
        <form
          className="w-full mt-4 space-y-3 justify-center flex flex-col"
          onSubmit={logIn}
        >
          <div>
            <input
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
              }}
              className="outline-none border-2 rounded-md px-2 py-1 text-slate-500 w-full focus:border-blue-300"
              placeholder="Tên tài khoản"
              type="text"
            />
          </div>
          <div>
            <input
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              className="outline-none border-2 rounded-md px-2 py-1 text-slate-500 w-full focus:border-blue-300"
              placeholder="Mật khẩu"
              id="password"
              name="password"
              type="password"
            />
          </div>
          <div
            className="self-center"
            dangerouslySetInnerHTML={{ __html: captchaData.content }}
          />
          <div>
            <input
              value={captcha}
              onChange={(e) => {
                setCaptcha(e.target.value);
              }}
              className="outline-none border-2 rounded-md px-2 py-1 text-slate-500 w-full focus:border-blue-300"
              placeholder="CAPTCHA"
              type="text"
            />
          </div>

          <button
            className="w-full justify-center py-1 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 rounded-md text-white ring-2"
            id="login"
            name="login"
            type="submit"
          >
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;

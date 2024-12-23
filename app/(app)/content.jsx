"use client";

import { useState } from "react";
import SignIn from "./signIn";
import Main from "./main";

const Content = ({ captchaData }) => {
  const [token, setToken] = useState(
    "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIwMjAwOTA2MDQ5IiwidHlwZSI6MiwiZXhwIjoxNzM1MDMwMzE3LCJpYXQiOjE3MzQ5NDM5MTd9.6MqujAG--m5zE2_6vbd8_R0pDKoagQrL421HI_xuPtmiRaz1y9ZtNXtNx4Zz3D52eqOnGKDIBOvl0df40cXp7Q"
  );
  //   console.log(captchaData);
  return (
    <>
      {token ? (
        <Main token={token} />
      ) : (
        <SignIn captchaData={captchaData} setToken={setToken} />
      )}
    </>
  );
};

export default Content;

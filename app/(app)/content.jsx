"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import SignIn from "./signIn";
const Main = dynamic(() => import("./main"), { ssr: false });

const Content = ({ captchaData }) => {
  const [token, setToken] = useState(
    "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIwMjAwOTA2MDQ5IiwidHlwZSI6MiwiZXhwIjoxNzM1MTM2NDQzLCJpYXQiOjE3MzUwNTAwNDN9.Wrg-CeLYjQBNpzmUMput3wreQfRhQFk0AQ4McwcpucDES40ypKwKDugOZ7Fy2syR4Dq2Ykk1bwUE3Gv_Gi9CZA"
  );
  //   console.log(captchaData);
  return (
    <div>
      {token ? (
        <Main token={token} />
      ) : (
        <SignIn captchaData={captchaData} setToken={setToken} />
      )}
    </div>
  );
};

export default Content;

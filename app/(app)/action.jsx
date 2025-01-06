"use server";
import { toTCVN3, toUnicode } from "vietnamese-conversion";
import adodb from "node-adodb";
export async function importData(path, password) {
  const cn = `Provider=Microsoft.Jet.OLEDB.4.0;Data Source=C:\\Users\\ThangBui\\Desktop\\Databank2024.mdb;Jet OLEDB:Database Password=chinh;`;

  const connection = adodb.open(cn);

  connection
    .query("SELECT TENVTHH FROM SoCai;")
    .then((data) => {
      console.log(toUnicode(data[0].TENVTHH, "TCVN3"));
    })
    .catch((err) => {
      console.log(JSON.stringify(err));
    });
}

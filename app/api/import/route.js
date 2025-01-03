import adodb from "node-adodb";
import { toUnicode } from "vietnamese-conversion";

export async function POST(request) {
  const { path, password } = await request.json();
  console.log(path.split("/").join("\\"));
  const cn = `Provider=Microsoft.Jet.OLEDB.4.0;Data Source=${path
    .split("/")
    .join("\\")};Jet OLEDB:Database Password=chinh;`;

  const connection = adodb.open(cn);

  connection
    .query("SELECT TENVTHH FROM SoCai;")
    .then((data) => {
      console.log(toUnicode(data[0].TENVTHH, "TCVN3"));
    })
    .catch((err) => {
      console.log(err);
    });

  return Response.json({ path, password });
}

import { getCaptcha } from "@/ultis";
import Content from "./(app)/content";
export const dynamic = "force-dynamic";

export default async function Home() {
  const captcha = await getCaptcha();

  if (captcha.status !== 200) {
    throw new Error("Failed to fetch captcha");
  }

  return (
    <div>
      <Content captchaData={captcha.data} />
    </div>
  );
}

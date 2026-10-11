import { DailyQuest } from "../features/tasks/daily-quest";
import { connection } from "next/server";

export default async function Home() {
  await connection();
  return <DailyQuest />;
}

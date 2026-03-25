import { client } from "@/app/db";
import { Card } from "@/components/dashboard/card";
import {UserTable} from "@/app/admin/center/user-table";

export default async function Page() {
  const query = "SELECT * FROM users";
  const result = await client.query(query);
  const count = result.rowCount
  return (
    <>
      <h1 className="text-2xl font-medium">控制面板</h1>
      <Card className="mt-4 w-52 mb-8">
        <h3 className="text-md">注册用户数</h3>
        <h1 className="text-2xl font-medium">{count}</h1>
      </Card>
      <UserTable data={result.rows} />
    </>
  );
}

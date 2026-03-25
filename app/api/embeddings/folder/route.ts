import { auth } from "@/auth";
import { client } from "@/app/db";

/**
 * 创建文件夹
 * @param request
 * @constructor
 * title: 文件夹名称
 * parent_id?: 父文件夹 id
 */

export async function POST(request: Request) {
  const authentication = await auth();
  if (!authentication) return new Response("Unauthorized", { status: 401 });
  const userId = authentication.user?.id;

  const { title, parent_id } = await request.json();

  if (!title) return new Response("请输入标题", { status: 400 });

  const folderId = crypto.randomUUID();
  const folderStatment =
    "INSERT INTO folders (id, name, parent_id, created_by) VALUES ($1, $2, $3, $4) RETURNING id";

  try {
    const values = [folderId, title, parent_id, userId];
    await client.query(folderStatment, values);
  } catch (e) {
    console.error(e);
    return new Response("Error connecting to database", { status: 500 });
  }
  return new Response("Folder created", { status: 201 });
}

/**
 * 修改文件夹名称
 * @param request
 * @constructor
 * title: 文件夹名称
 * folder_id: 文件夹 id
 */
export async function PUT(request: Request) {
  const authentication = await auth();
  if (!authentication) return new Response("Unauthorized", { status: 401 });
  const userId = authentication.user?.id;

  const { title, folder_id } = await request.json();

  if (!title) return new Response("请输入标题", { status: 400 });

  const folderStatment =
    "UPDATE folders SET name = $1 WHERE id = $2";

  try {
    const values = [title, folder_id, userId];
    await client.query(folderStatment, values);
  } catch (e) {
    console.error(e);
    return new Response("Error connecting to database", { status: 500 });
  }
  return new Response("Folder updated", { status: 200 });
}

/**
 * 删除文件夹
 * @param request
 * @constructor
 * folder_id: 文件夹 id
 */
export async function DELETE(request: Request) {
  const authentication = await auth();
  if (!authentication) return new Response("Unauthorized", { status: 401 });
  const userId = authentication.user?.id;

  const { folder_id } = await request.json();

  if (!folder_id) return new Response("请输入文件夹 id", { status: 400 });

  const folderStatment =
    "DELETE FROM folders WHERE id = $1";

  try {
    const values = [folder_id, userId];
    await client.query(folderStatment, values);
  } catch (e) {
    console.error(e);
    return new Response("Error connecting to database", { status: 500 });
  }
  return new Response("Folder deleted", { status: 200 });
}
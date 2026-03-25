import { client } from "@/app/db";
import { auth } from "@/auth";

/**
 * 将文件放入文件夹
 * @param {string} folderId 文件夹ID
 * @param {string} fileId 文件ID
 */
export async function PUT(request: Request) {
  const authentication = await auth();
  if (!authentication) return new Response("Unauthorized", { status: 401 });
  const userId = authentication.user?.id;

  const { folderId, fileId } = await request.json();

  if (!folderId || !fileId)
    return new Response("请输入文件夹 id 和文件 id", { status: 400 });

  let folderStatment, values;
  if (folderId === "root")
  {
    folderStatment = "UPDATE sources SET folder_id = NULL WHERE id = $1";
    values = [fileId];

  }
  else {
    folderStatment = "UPDATE sources SET folder_id = $1 WHERE id = $2";
    values = [folderId, fileId];
  }

  try {
    await client.query(folderStatment, values);
  } catch (e) {
    console.error(e);
    return new Response("Error connecting to database", { status: 500 });
  }
  return new Response("File moved", { status: 200 });
}

/**
 * 将文件放回到根目录
 * @param {string} fileId 文件ID
 */
// export async function DELETE(request: Request) {
//   const authentication = await auth();
//   if (!authentication) return new Response("Unauthorized", { status: 401 });
//   const userId = authentication.user?.id;
//
//   const { fileId } = await request.json();
//
//   if (!fileId) return new Response("请输入文件 id", { status: 400 });
//
//   const folderStatment = "UPDATE sources SET folder_id = NULL WHERE id = $1";
//
//   try {
//     await client.connect();
//     const values = [fileId];
//     await client.query(folderStatment, values);
//   } catch (e) {
//     console.error(e);
//     return new Response("Error connecting to database", { status: 500 });
//   }
//   return new Response("File Deleted", { status: 200 });
// }

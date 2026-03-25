import { AlibabaTongyiEmbeddings } from "@langchain/community/embeddings/alibaba_tongyi";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "@langchain/core/documents";

import { config } from "@/app/db/embeddings";
import { auth } from "@/auth";
import { client } from "@/app/db";
import {revalidatePath} from "next/cache";

function getAlibabaApiKey() {
  const key = process.env.ALIBABA_API_KEY;
  if (!key) throw new Error("Missing environment variable ALIBABA_API_KEY");
  return key;
}

/**
 * 创建文档及 embeddings
 * 首先在 `sources` 数据库中创建文档
 * 然后使用 `langchain` 生成对应的 embeddings
 * @param request
 * @constructor
 */
export async function POST(request: Request) {

  const authentication = await auth();
  if (!authentication) return new Response("Unauthorized", { status: 401 });

  const { content, title } = await request.json();
  if (!content) {
    return new Response("请输入内容", { status: 400 });
  }

  if (!title) {
    return new Response("请输入标题", { status: 400 });
  }

  const documentID = crypto.randomUUID();

  try {
    const statement =
      "INSERT INTO sources (id, name, content, content_length, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING id";
    const values = [
      documentID,
      title,
      content,
      content.length,
      authentication?.user?.id,
    ];
    await client.query(statement, values);
  } catch (e) {
    console.error(e);
    return new Response("Error connecting to database", { status: 500 });
  }

  try {
    const textSplitter = RecursiveCharacterTextSplitter.fromLanguage("html", {
      chunkSize: 500,
      chunkOverlap: 100,
    });
    const output = await textSplitter.splitDocuments([
      new Document({
        pageContent: content,
        metadata: {
          title,
          id: documentID,
        },
      }),
    ]);
    console.log(output);

    const pgvectorStore = await PGVectorStore.initialize(
      new AlibabaTongyiEmbeddings({
        apiKey: getAlibabaApiKey(),
        parameters: {
          text_type: "document",
        },
      }),
      config,
    );

    await pgvectorStore.addDocuments(output);

    await pgvectorStore.end();

    return new Response(JSON.stringify("ok"), { status: 200 });
  } catch (e: any) {
    console.error(e);
    return new Response(e.message, { status: 500 });
  }
}

/**
 * 更新文档
 * @param request
 * @constructor
 * 在 `sources` 数据库中更新文档
 * 重新生成对应的 embeddings
 */
export async function PUT(request: Request) {

  const authentication = await auth();
  if (!authentication) return new Response("Unauthorized", { status: 401 });

  const { content, id } = await request.json();
  if (!content) {
    return new Response("未提供文档内容，请刷新后重试", { status: 400 });
  }
  if (!id) {
    return new Response("未提供 id，请刷新后重试", { status: 400 });
  }

  let fileName = ''

  try {
    const statement =
      "UPDATE sources SET content = $1, content_length = $2 WHERE id = $3 RETURNING name";
    const values = [content, content.length, id];
    const response = await client.query(statement, values);
    fileName = response.rows[0].name
  } catch (e) {
    console.error(e);
    return new Response("Error connecting to database", { status: 500 });
  }

  try {
    /**
     * Delete existing embeddings
     */
    const pgvectorStore = await PGVectorStore.initialize(
      new AlibabaTongyiEmbeddings({
        apiKey: getAlibabaApiKey(),
        parameters: {
          text_type: "document",
        },
      }),
      config,
    );
    await pgvectorStore.delete({
      filter: {
        title: fileName
      }
    })
    const textSplitter = RecursiveCharacterTextSplitter.fromLanguage("html", {
      chunkSize: 500,
      chunkOverlap: 100,
    });
    const output = await textSplitter.splitDocuments([
      new Document({
        pageContent: content,
        metadata: {
          title: fileName,
          id,
        },
      }),
    ]);
    console.log(output);

    await pgvectorStore.addDocuments(output);

    await pgvectorStore.end();
    return new Response(JSON.stringify('ok'), { status: 200 })

  } catch (e: any) {
    console.error(e);
    return new Response(e.message, { status: 500 });
  }
}

/**
 * 删除文档
 * @param request
 * @constructor
 */
export async function DELETE(request: Request) {

    const authentication = await auth();
    if (!authentication) return new Response("Unauthorized", { status: 401 });

    const { id } = await request.json();
    if (!id) {
      return new Response("未提供 id，请刷新后重试", { status: 400 });
    }

    try {
      const statement = "DELETE FROM sources WHERE id = $1";
      const values = [id];
      await client.query(statement, values);
    } catch (e) {
      console.error(e);
      return new Response("Error connecting to database", { status: 500 });
    }

    try {
      const pgvectorStore = await PGVectorStore.initialize(
        new AlibabaTongyiEmbeddings({
          apiKey: getAlibabaApiKey(),
          parameters: {
            text_type: "document",
          },
        }),
        config,
      );
      await pgvectorStore.delete({
        filter: {
          id
        }
      })
      await pgvectorStore.end();
      revalidatePath('/admin/datasource')
      return new Response(JSON.stringify('ok'), { status: 200 })
    } catch (e: any) {
      console.error(e);
      return new Response(e.message, { status: 500 });
    }
}


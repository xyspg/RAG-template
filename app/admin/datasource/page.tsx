import React from "react";
import { KnowledgeCard } from "@/app/admin/datasource/knowledge-card";
import { Textarea } from "@/components/ui/textarea";
import { client } from "@/app/db";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import NewFolder from "@/app/admin/datasource/new-folder";

export default async function Page({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const statement = "SELECT * FROM sources";
  let files;

  if (searchParams.s) {
    const query = "SELECT * FROM sources WHERE name LIKE $1 OR content LIKE $1";
    files = await client.query(query, [`%${searchParams.s}%`]);
  } else {
    files = await client.query(statement);
  }
  const folderQuery = "SELECT * FROM folders";
  const folders = await client.query(folderQuery);
  const data = buildFolderTree(folders, files);
  const unsorted = files.rows.filter((file) => !file.folder_id);

  return (
    <div className="w-full">
      <div className="flex flex-row gap-2 mt-4">
        <Button className="">
          <Link href="/admin/datasource/create">添加新文档</Link>
        </Button>
        <NewFolder />
      </div>
      <div className="h-4" />
      <KnowledgeCard data={data} unsorted={unsorted} />
    </div>
  );
}

function buildFolderTree(folders: { rows: any[] }, files: { rows: any[] }) {
  const folderMap = new Map();

  // Initialize map with folders
  folders.rows.forEach((folder) => {
    folder.children = [];
    folderMap.set(folder.id, folder);
  });

  // Associate files with folders
  files.rows.forEach((file) => {
    if (file.folder_id && folderMap.has(file.folder_id)) {
      folderMap.get(file.folder_id).children.push(file);
    }
  });

  // Build the tree
  const rootFolders: any[] = [];
  folderMap.forEach((folder) => {
    if (folder.parent_id) {
      if (folderMap.has(folder.parent_id)) {
        folderMap.get(folder.parent_id).children.push(folder);
      }
    } else {
      rootFolders.push(folder);
    }
  });

  return rootFolders;
}

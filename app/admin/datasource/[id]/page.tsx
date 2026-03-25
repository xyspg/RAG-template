import React, { Fragment } from "react";
import Tiptap from "@/components/Editor/Tiptap";
import { client } from "@/app/db";
import { JSX } from "solid-js";
import ModifyContent from "@/app/admin/datasource/[id]/modify-content";
import Link from "next/link";
import BackButton from "@/components/back-button";

const Page = async ({ params }: { params: { id: string } }) => {
  const { id } = params;
  console.log(id);
  let content;
  try {
    const response = await client.query("SELECT * FROM sources WHERE id = $1", [
      id,
    ]);
    if (response.rowCount === 0) {
      return <div>Not found</div>;
    }
    content = response.rows[0].content;
  } catch (e) {
    console.error(e);
    return <div>404 Not Found</div>;
  }
  return (
    <Fragment>
      <BackButton href='/admin/datasource'/>
      <ModifyContent content={content} id={id} />
    </Fragment>
  );
};

export default Page;

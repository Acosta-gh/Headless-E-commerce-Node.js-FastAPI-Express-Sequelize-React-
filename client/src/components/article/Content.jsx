"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

function Content({ content, coverImage }) {
  console.log(content);
  return (
    <article className="space-y-8 ">
      {coverImage && (
        <div className="bg-muted aspect-video w-full overflow-hidden rounded-xl">
          <img
            src={coverImage}
            alt="Article cover"
            className="h-full w-full object-cover"
          />
        </div>
      )}
      <div className="prose max-w-none break-words">
        <ReactMarkdown
          rehypePlugins={[rehypeSanitize]}
          components={{
            img: ({ node, ...props }) => (
              <div className="flex justify-center my-4">
                <img {...props} className="max-w-full h-auto rounded-xl" />
              </div>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </article>
  );
}

export default Content;
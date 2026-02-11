"use client";
import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

function Content({ content, coverImage }) {
  return (
    <article className="space-y-8">
      <div className="border rounded-xl overflow-hidden bg-card">
        {/* Section Header */}
        <div className="border-b bg-muted px-6 py-4">
          <h2 className="text-2xl font-bold">
            Especificaciones Técnicas
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Información detallada del producto
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="prose prose-neutral dark:prose-invert max-w-none break-words">
            <ReactMarkdown
              rehypePlugins={[rehypeSanitize]}
              components={{
                img: ({ node, ...props }) => (
                  <div className="my-4 flex justify-center">
                    <img 
                      {...props} 
                      className="max-w-full h-auto rounded-lg border" 
                    />
                  </div>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Additional Info Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 bg-card">
          <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center mb-3">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-semibold mb-1">Calidad Garantizada</h3>
          <p className="text-sm text-muted-foreground">
            Todos nuestros productos cumplen con las normas de seguridad y calidad vigentes.
          </p>
        </div>

        <div className="border rounded-lg p-4 bg-card">
          <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center mb-3">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="font-semibold mb-1">Soporte Técnico</h3>
          <p className="text-sm text-muted-foreground">
            Asesoramiento profesional para instalación y mantenimiento de tu equipo.
          </p>
        </div>

        <div className="border rounded-lg p-4 bg-card">
          <div className="h-10 w-10 bg-muted rounded-lg flex items-center justify-center mb-3">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-semibold mb-1">Mejor Precio</h3>
          <p className="text-sm text-muted-foreground">
            Precios competitivos y promociones especiales para nuestros clientes.
          </p>
        </div>
      </div>
    </article>
  );
}

export default Content;
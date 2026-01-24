import React from "react";

function Services() {
  return (
    <section className="pb-32 mx-auto">
      {/* Hero */}
      <div className="bg-muted flex flex-col items-center justify-center text-center py-32 min-h-[60vh]">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
          Services
        </h1>
        <p className="mt-4 max-w-2xl text-muted-foreground text-lg">
            We offer a variety of services to meet your needs.
        </p>
      </div>

      {/* Intro */}
      <div className="">
        <div className="mx-auto max-w-3xl  text-left">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground">
            Lorem, ipsum dolor.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ad
            quibusdam vel, quia, dolorem quisquam maiores animi error illo
            sapiente sunt reiciendis modi libero qui voluptatum ullam? Illo
            eligendi rerum sunt.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className=" ">
        <div className="mx-auto max-w-3xl text-left">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            Lorem
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quisquam
            quam, quidem.
          </p>

          <h3 className="text-2xl font-semibold tracking-tight text-foreground">
            Ipsum
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam,
            quidem.
          </p>

          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Lorem ipsum dolor sit amet.</li>
            <li>Consectetur adipisicing elit.</li>
            <li>Quisquam, quidem.</li>
          </ul>

          <p className="text-muted-foreground leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quisquam,
            quidem.
          </p>
        </div>
      </div>
    </section>
  );
}

export default Services;

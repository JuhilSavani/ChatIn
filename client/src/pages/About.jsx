import React from "react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="page min-h-full w-full overflow-auto">
      <div className="mx-auto flex w-[min(92vw,1200px)] flex-col gap-6 py-8 sm:gap-[1.5rem] sm:py-[5rem]">
        <section>
          <h2 className="w-fit border-b-[3px] border-dashed border-primary-black bg-primary-white pr-6 text-[1.25rem] font-bold sm:pr-[4rem] sm:text-[1.5rem]">About ChatIn'</h2>
          <p className="mt-4 text-[1rem] leading-relaxed sm:text-[1.2rem]">
            <strong>ChatIn'</strong> is a project designed to explore and
            showcase how <strong>real-time communication</strong> happens using
            WebSockets. This project highlights key aspects of web development, 
            including authentication, routing, and minimalist design, while 
            integrating with WebSocket for <strong>instant messaging.</strong>
          </p>
        </section>
        <section>
          <h2 className="w-fit border-b-[3px] border-dashed border-primary-black bg-primary-white pr-6 text-[1.25rem] font-bold sm:pr-[4rem] sm:text-[1.5rem]">Behind the Scenes</h2>
          <p className="mt-4 text-[1rem] leading-relaxed sm:text-[1.2rem]">
            <strong>ChatIn</strong> is built on-top of modern web technologies
            to deliver a fast, secure, and reliable messaging experience. The
            app utilizes <strong>Passport.js</strong> for secure user authentication, 
            ensuring that only authorized users can access their accounts. It also 
            uses <strong>React Query</strong> for efficient data fetching, caching, 
            and synchronization, making the app faster and more responsive. On the 
            backend, <strong>WebSocket</strong> provides real-time communication, 
            allowing users to send and receive messages instantly without the need 
            to refresh the page.
          </p>
        </section>
        <section>
          <style>{`@keyframes moveSideToSide{0%,100%{transform:translateX(0)}50%{transform:translateX(10px)}}`}</style>
          <h2 className="flex w-fit items-center gap-3 border-b-[3px] border-dashed border-primary-black bg-primary-white pr-6 text-[1.25rem] font-bold sm:gap-4 sm:pr-[4rem] sm:text-[1.5rem]">
            <Link to="/">Explore the Project</Link>
            <div className="flex items-center">
              <i className="bx bxs-chevrons-left relative text-[1.4rem] animate-[moveSideToSide_1.5s_ease-in-out_infinite] sm:text-[1.725rem]" style={{animationDelay: "0s"}}></i>
              <i className="bx bxs-chevrons-left relative text-[1.4rem] animate-[moveSideToSide_1.5s_ease-in-out_infinite] sm:text-[1.725rem]" style={{animationDelay: "0.2s"}}></i>
              <i className="bx bxs-chevrons-left relative text-[1.4rem] animate-[moveSideToSide_1.5s_ease-in-out_infinite] sm:text-[1.725rem]" style={{animationDelay: "0.4s"}}></i>
            </div>
          </h2>
          <p className="mt-4 text-[1rem] leading-relaxed sm:text-[1.2rem]">
            Check out <strong>ChatIn'</strong> and see the technology in action!
            Create an account, add friends by email, and start chatting to test
            out the live messaging feature. The goal of this project is to
            provide a fully functional messaging app with a clean, modular
            structure and an intuitive, minimalist user interface.
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;

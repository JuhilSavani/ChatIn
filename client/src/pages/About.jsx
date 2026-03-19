import React from "react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="page min-h-[calc(100vh-80px)] w-full">
      <div className="flex flex-col gap-[1.5rem] py-[5rem] w-[74vw] max-w-[1200px] mx-auto">
        <section>
          <h2 className="bg-primary-white text-[1.5rem] w-fit pr-[4rem] border-b-[3px] border-dashed border-primary-black font-bold">About ChatIn'</h2>
          <p className="mt-4 text-[1.2rem] leading-relaxed">
            <strong>ChatIn'</strong> is a project designed to explore and
            showcase how <strong>real-time communication</strong> happens using
            WebSockets. This project highlights key aspects of web development, 
            including authentication, routing, and minimalist design, while 
            integrating with WebSocket for <strong>instant messaging.</strong>
          </p>
        </section>
        <section>
          <h2 className="bg-primary-white text-[1.5rem] w-fit pr-[4rem] border-b-[3px] border-dashed border-primary-black font-bold">Behind the Scenes</h2>
          <p className="mt-4 text-[1.2rem] leading-relaxed">
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
          <h2 className="flex items-center gap-4 bg-primary-white text-[1.5rem] w-fit pr-[4rem] border-b-[3px] border-dashed border-primary-black font-bold">
            <Link to="/">Explore the Project</Link>
            <div className="flex items-center">
              <i className="bx bxs-chevrons-left text-[1.725rem] relative animate-[moveSideToSide_1.5s_ease-in-out_infinite]" style={{animationDelay: "0s"}}></i>
              <i className="bx bxs-chevrons-left text-[1.725rem] relative animate-[moveSideToSide_1.5s_ease-in-out_infinite]" style={{animationDelay: "0.2s"}}></i>
              <i className="bx bxs-chevrons-left text-[1.725rem] relative animate-[moveSideToSide_1.5s_ease-in-out_infinite]" style={{animationDelay: "0.4s"}}></i>
            </div>
          </h2>
          <p className="mt-4 text-[1.2rem] leading-relaxed">
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

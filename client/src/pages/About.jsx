import React from "react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="page about">
      <div className="container">
        <section>
          <h2>About ChatIn'</h2>
          <p>
            <strong>ChatIn'</strong> is a project designed to explore and
            showcase how <strong>real-time communication</strong> happens using
            WebSockets. This project highlights key aspects of web development, 
            including authentication, routing, and minimalist design, while 
            integrating with WebSocket for <strong>instant messaging.</strong>
          </p>
        </section>
        <section>
          <h2>Behind the Scenes</h2>
          <p>
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
          <h2 className="cta">
            <Link to="/">Explore the Project</Link>
            <i className="bx bxs-chevrons-left"></i>
            <i className="bx bxs-chevrons-left"></i>
            <i className="bx bxs-chevrons-left"></i>
          </h2>
          <p>
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

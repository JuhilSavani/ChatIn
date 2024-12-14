import React from "react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="page about">
      <div className="container">
        <section>
          <h2>About ChatIn</h2>
          <p>
            <strong>ChatIn'</strong> is a project to experiment with and
            showcase real-time communication technologies. This platform
            demonstrates key aspects of web development, including
            authentication, routing, and minimalist design, while integrating
            with WebSocket for instant messaging.
          </p>
        </section>
        <section>
          <h2>Behind the Scenes</h2>
          <p>
            <strong>ChatIn'</strong> is built using modern web technologies to
            deliver a fast and reliable messaging experience. This project uses{" "}
            <strong>Passport.js</strong> for secure authentication,{" "}
            <strong>React.js</strong> for a modular and minimalist web frontend,
            and <strong>WebSocket</strong> to enable real-time communication.
          </p>
        </section>
        <section>
          <h2 className="cta">
            <Link to="/">Explore the Project</Link>
            <i class="bx bxs-chevrons-left"></i>
            <i class="bx bxs-chevrons-left"></i>
            <i class="bx bxs-chevrons-left"></i>
          </h2>
          <p>
            Check out <strong>ChatIn'</strong> and see the technology in action.
            Feel free to create an account or jump into a chat room to test out
            the live messaging feature! The goal is to demonstrate a fully
            functional messaging app in a clean, modular way.
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;

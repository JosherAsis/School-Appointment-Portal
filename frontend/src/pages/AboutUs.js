import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/AboutUs.css';

const AboutUs = () => {
  // Team members data
  const teamMembers = [
    {
      name: 'Crisven Furia',
      role: 'Project Lead & Full Stack Developer',
      description: 'Responsible for overall project architecture and implementation of core features.',
      image: '/images/team/Crisven-Furia.png'
    },
    {
      name: 'Raffy Naul',
      role: 'UI/UX Designer',
      description: 'Created the user interface design and ensured a seamless user experience across the platform.',
      image: '/images/team/Raffy-Naul.png'
    },
    {
      name: 'John Marco Redecio',
      role: 'UI/UX Designer',
      description:'Created the user interface design and ensured a seamless user experience across the platform.',
      image: '/images/team/Marco-Redecio.png'
    },
    {
      name: 'Jude Andrei Dimayuga',
      role: 'Backend Developer',
      description: 'Developed the server-side logic, database structure, and API endpoints.',
      image: '/images/team/Jude-Dimayuga.png'
    },
    {
      name: 'Jhon Patrick Salen',
      role: 'Backend Developer',
      description: 'Developed the server-side logic, database structure, and API endpoints.',
      image: '/images/team/Patrick-Salen.png'
    },
    {
      name: 'Josher Asis',
      role: 'Frontend Developer',
      description: 'Implemented responsive UI components and integrated with backend services.',
      image: '/images/team/Josher-Asis.png'
    },
    {
      name: 'Jayvee Mendiola',
      role: 'Frontend Developer',
      description: 'Implemented responsive UI components and integrated with backend services.',
      image: '/images/team/Jayvee-Mendiola.png'
    },
    {
      name: 'Chrizha Mae Angeles',
      role: 'Database Manager',
      description: 'Designed the database architecture, optimized queries, and ensured data integrity and security. Managed database operations including migrations and backups.',
      image: '/images/team/Chrizha-Angeles.png'
    }
  ];

  return (
    <div className="about-us-container">
      <div className="about-header">
        <h1>About Us</h1>
        <div className="team-intro">
          <h2>Portal Ducks</h2>
          <p>
            We are a dedicated team of developers and designers passionate about creating
            efficient solutions for educational institutions. Our School Appointment Portal
            was developed to streamline the appointment booking process between students and
            school administrators.
          </p>
        </div>
      </div>

      <div className="about-section">
        <h2>Our Mission</h2>
        <p>
          We created the School Appointment Portal to make life easier for students at Pateros Technological College.
          Before this system, getting documents like the COR or COG meant long lines, delays, and sometimes having to come back another day,
          especially during peak times. Our mission was to change that. This will not only saves time but also reduces the administrative workload
          for both students and school staff. In short, we built this portal to make document requests simpler, faster, and more student-friendly
          for everyone at PTC.
        </p>
      </div>

      <div className="about-section">
        <h2>Project Overview</h2>
        <p>
          The School Appointment Portal is a comprehensive web application designed to manage
          student appointments with school administrators efficiently. It features user authentication,
          role-based access control, appointment scheduling, email notifications, and reporting capabilities.
        </p>
        <p>
          This project was developed as part of our Final project at Pateros Technological College,
          demonstrating our ability to create practical solutions for real-world problems in
          educational settings.
        </p>
      </div>

      <div className="team-section">
        <h2>Meet Our Team</h2>
        <div className="team-members">
          {teamMembers.map((member, index) => (
            <div className="team-member-card" key={index}>
              <div className="member-image">
                <img
                  src={member.image}
                  alt={member.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/images/default-profile.svg';
                  }}
                />
              </div>
              <div className="member-info">
                <h3>{member.name}</h3>
                <h4>{member.role}</h4>
                <p>{member.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="about-section">
        <h2>Technologies Used</h2>
        <div className="technologies">
          <div className="tech-category">
            <h3>Frontend</h3>
            <ul>
              <li>React.js</li>
              <li>React Router</li>
              <li>CSS3</li>
              <li>HTML5</li>
            </ul>
          </div>
          <div className="tech-category">
            <h3>Backend</h3>
            <ul>
              <li>Node.js</li>
              <li>Express.js</li>
              <li>MySQL</li>
              <li>JWT Authentication</li>
            </ul>
          </div>
          <div className="tech-category">
            <h3>Tools</h3>
            <ul>
              <li>Git & GitHub</li>
              <li>VS Code</li>
              <li>Postman</li>
              <li>npm</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="contact-section">
        <h2>Get in Touch</h2>
        <p>
          Have questions or feedback about our School Appointment Portal?
          Feel free to reach out to us through our <Link to="/contact">Contact page</Link>.
        </p>
      </div>
    </div>
  );
};

export default AboutUs;

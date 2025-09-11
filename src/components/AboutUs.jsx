import lightbulbIcon from '../assets/light_bulb-icon.png';
import likeIcon from '../assets/like-icon.png';
import vdoIcon from "../assets/vdo_icon.png";
import codeIcon from '../assets/code-icon.png';
import instagram from '../assets/instagram.png';
import jadImage from '../assets/jad.png';
import chanrothImage from '../assets/chanroth.png';
import rachanaImage from '../assets/rachana.png';
import seaklimImage from '../assets/seaklim.png';
import habImage from '../assets/hab.png';
import theanImage from '../assets/thean.png';
import meyImage from '../assets/mey.png';

const offers = [
  {
    icon: lightbulbIcon,
    alt: "Lightbulb Icon",
    title: "Concept-Based Learning",
    desc: "We break down complex programming languages into manageable topics like variables, loops, and functions. This way, you can learn one key concept at a time before moving on to the next.",
    popup: "Learn step-by-step with focused concepts!"
  },
  {
    icon: likeIcon,
    alt: "Like Icon",
    title: "Simple, Real-World Examples",
    desc: "Our lessons include practical, easy-to-read code examples with clear, step-by-step explanations, showing you how these concepts are used in the real world.",
    popup: "See how code works in real projects!"
  },
  {
    icon: vdoIcon,
    alt: "Video Icon",
    title: "Instructional Videos",
    desc: "Each key point is supported by a short, focused video tutorial (2–10 minutes) that visually walks you through the code and reinforces what you've learned.",
    popup: "Watch and learn visually with short videos!"
  },
  {
    icon: codeIcon,
    alt: "Code Icon",
    title: "A Growing Library of Languages",
    desc: <>We're starting with some of the most popular languages used today, including <strong>Python, C, C++, Java, and Javascript</strong>. We're committed to expanding our library and adding more exciting topics in the future!</>,
    popup: "Explore more languages as we grow!"
  }
];

// Team data for organizational tree
const mentors = [
  {
    id: 1,
    name: "Lim Huot",
    role: "Mentor",
    image: "https://media.licdn.com/dms/image/v2/D4D03AQEwPdzTYcAWyQ/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1697662062435?e=2147483647&v=beta&t=7Hx9cYuN89rkEQLYzoAFewFgyt_rsaptvYY162XfJcE",
    expertise: "Full-Stack Developer"
  },
  {
    id: 2,
    name: "Vanak Seaklim",
    role: "Mentor",
    image: seaklimImage,
    expertise: "Computer Science"
  }
];

const frontendTeam = [
  {
    id: 3,
    name: "Sophal Chanrat",
    role: "Backend Developer",
    image: chanrothImage,
    skills: ["React", "Express", "JavaScript"]
  },
  {
    id: 4,
    name: "Te Chhenghab",
    role: "Backend Developer",
    image: habImage,
     skills: ["React", "Express", "JavaScript"]
  },
  {
    id: 5,
    name: "Sithav Seavthean",
      role: "Backend Developer",
    image: theanImage,
  skills: ["React", "Express", "JavaScript"]
  }
];

const backendTeam = [
  {
    id: 6,
    name: "Oem Rachana",
     role: "Frontend Developer",
    image: rachanaImage,
    skills: ["React", "Express", "Tailwind CSS"]
  },
  {
    id: 7,
    name: "Chhorn Norakjed",
    role: "Frontend Developer",
    image: jadImage,
     skills: ["React", "Express", "Tailwind CSS"]
  },
  {
    id: 8,
    name: "Keo Sivmey",
    role: "Frontend Developer",
    image: meyImage,
    skills: ["React", "Express", "Tailwind CSS"]
  }
];

export default function BitCampusContent() {
  return (
    <div className="min-h-screen bg-[#2c3e50]">
      {/* Hero Section */}
      <section className="text-center py-16 px-6">
        <h1 className="text-4xl md:text-5xl font-bold text-[#00a8e8] mb-6">Welcome to Bitcampus</h1>
        <p className="text-white text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
          A virtual campus where we believe that learning to code should be simple and accessible for everyone.
        </p>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 space-y-8 pb-16">
        {/* Our Mission */}
        <div className="bg-white rounded-2xl p-8 shadow-lg transition-all duration-300 hover:scale-[1.01]">
          <h2 className="text-3xl font-bold text-black text-center mb-6">Our Mission</h2>
          <p className="text-black text-lg leading-relaxed text-center">
            Our goal is to make programming easy to understand and fun to learn. We're dedicated to helping you master
            core programming concepts without feeling overwhelmed. We want to empower you with the skills you need to
            succeed in today's digital world, whether you're a student, a career-changer, or just curious about how
            things work.
          </p>
        </div>

        {/* Organizational Tree */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-black text-center mb-10">Meet Our Team</h2>
          
          {/* Mentors at Top */}
          <div className="flex justify-center mb-4">
            <div className="flex space-x-8">
              {mentors.map((mentor) => (
                <div key={mentor.id} className="text-center group">
                  <div className="relative">
                    <img 
                      src={mentor.image} 
                      alt={mentor.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-[#00a8e8] group-hover:scale-110 transition-transform duration-300 object-cover"
                    />
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <div className="w-4 h-4 bg-[#00a8e8] rotate-45"></div>
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-black">{mentor.name}</h3>
                  <p className="text-[#00a8e8] font-medium">{mentor.role}</p>
                  <p className="text-gray-600 text-sm mt-2">{mentor.expertise}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Connection Lines */}
          <div className="relative mb-12"> 
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-12 bg-[#00a8e8]"></div>
            <div className="absolute top-12 left-1/4 right-1/4 h-0.5 bg-[#00a8e8]"></div>
            <div className="absolute top-12 left-1/4 w-0.5 h-12 bg-[#00a8e8]"></div>
            <div className="absolute top-12 right-1/4 w-0.5 h-12 bg-[#00a8e8]"></div>
          </div>

          {/* Frontend and Backend Teams */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Frontend Team */}
            <div className="text-center py-20">
              {/* <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg mb-8 inline-block">
                <h3 className="text-xl font-bold">Frontend Team</h3>
              </div> */}
              <div className="relative">
                {frontendTeam.map((member, index) => (
                  <div key={member.id} className="relative">
                    <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-300 relative z-10">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <img 
                            src={member.image} 
                            alt={member.name}
                            className="w-16 h-16 rounded-full border-2 border-blue-300 object-cover"
                          />
                          {/* Hierarchy indicator */}
                          <div className="absolute -top-1 -left-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {index + 1}
                          </div>
                        </div>
                        <div className="text-left flex-1">
                          <h4 className="font-bold text-black">{member.name}</h4>
                          <p className="text-blue-600 text-sm">{member.role}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {member.skills.map((skill, idx) => (
                              <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Connection line to next member */}
                    {index < frontendTeam.length - 1 && (
                      <div className="flex justify-center my-4">
                        <div className="w-0.5 h-6 bg-blue-400"></div>
                        <div className="absolute left-1/2 transform -translate-x-1/2 mt-6">
                          <div className="w-3 h-3 bg-blue-400 rotate-45"></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Backend Team */}
            <div className="text-center py-20">
              {/* <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 px-6 rounded-lg mb-8 inline-block">
                <h3 className="text-xl font-bold">Backend Team</h3>
              </div> */}
              <div className="relative">
                {backendTeam.map((member, index) => (
                  <div key={member.id} className="relative">
                    <div className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-300 relative z-10">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <img 
                            src={member.image} 
                            alt={member.name}
                            className="w-16 h-16 rounded-full border-2 border-green-300 object-cover"
                          />
                          {/* Hierarchy indicator */}
                          <div className="absolute -top-1 -left-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {index + 1}
                          </div>
                        </div>
                        <div className="text-left flex-1">
                          <h4 className="font-bold text-black">{member.name}</h4>
                          <p className="text-green-600 text-sm">{member.role}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {member.skills.map((skill, idx) => (
                              <span key={idx} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Connection line to next member */}
                    {index < backendTeam.length - 1 && (
                      <div className="flex justify-center my-4">
                        <div className="w-0.5 h-6 bg-green-400"></div>
                        <div className="absolute left-1/2 transform -translate-x-1/2 mt-6">
                          <div className="w-3 h-3 bg-green-400 rotate-45"></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* What We Offer */}
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-black text-center mb-8">What We Offer</h2>
          <div className="space-y-6">
            {offers.map((item, idx) => (
              <div key={idx} className="relative group">
                <div className="flex items-start space-x-4 bg-white rounded-xl p-4 shadow-md transition-all duration-300 group-hover:scale-[1.03] group-hover:shadow-xl cursor-pointer">
                  <div className="w-15 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <img src={item.icon} alt={item.alt} className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="font-bold text-black text-lg mb-2">{item.title}</h3>
                    <p className="text-black leading-relaxed">{item.desc}</p>
                  </div>
                </div>
                {/* Popup Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-10 opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 pointer-events-none transition-all duration-300 z-10 px-4 py-2 bg-[#00a8e8] text-white text-sm rounded shadow-lg font-medium whitespace-nowrap">
                  {item.popup}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Us */}
        <div className="bg-white rounded-2xl p-8 shadow-lg transition-all duration-300 hover:scale-[1.01]">
          <h2 className="text-3xl font-bold text-black text-center mb-6">Contact Us</h2>
          <p className="text-black text-lg text-center mb-8">You may contact us through the platforms below</p>
          <div className="flex justify-center space-x-6">
            {/* Social icons unchanged */}
            <a
              href="#"
              className="w-12 h-12 bg-[#000000] rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
              aria-label="Twitter/X"
            >
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="#"
              className="w-12 h-12 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
              style={{ backgroundImage: "linear-gradient(45deg, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5)" }}>
              <img src={instagram} alt="instagram Icon" className="w-7 h-7"
                aria-label="Instagram" />
              <svg className="w-0 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.864 3.708 13.713 3.708 12.416s.49-2.448 1.418-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.275c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.404c-.315 0-.595-.122-.807-.315-.21-.21-.315-.49-.315-.807s.105-.595.315-.807c.21-.21.49-.315.807-.315s.595.105.807.315c.21.21.315.49.315.807s-.105.595-.315.807c-.21.193-.49.315-.807.315z" />
              </svg>
            </a>
            <a
              href="#"
              className="w-12 h-12 bg-[#0077b5] rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
              aria-label="LinkedIn"
            >
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
            <a
              href="#"
              className="w-12 h-12 bg-[#1877f2] rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
              aria-label="Facebook"
            >
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a
              href="#"
              className="w-12 h-12 bg-[#ff0000] rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity"
              aria-label="YouTube"
            >
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
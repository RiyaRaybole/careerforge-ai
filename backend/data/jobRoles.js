// Static job-role -> required-skills mapping used for rule-based matching.
// This is what Phase 7 uses instead of a paid job-search API — good enough
// for a portfolio project, and easy to explain in an interview.
const jobRoles = [
  {
    title: "Frontend Developer",
    requiredSkills: ["javascript", "react", "html", "css", "typescript", "redux"],
    courses: ["React - The Complete Guide (Udemy)", "freeCodeCamp Responsive Web Design"],
  },
  {
    title: "Backend Developer",
    requiredSkills: ["node.js", "express", "mongodb", "sql", "rest api", "python"],
    courses: ["Node.js API Masterclass (Udemy)", "Designing Data-Intensive Applications (Book)"],
  },
  {
    title: "Full Stack Developer",
    requiredSkills: ["javascript", "react", "node.js", "mongodb", "express", "git"],
    courses: ["The Odin Project", "MERN Stack Front To Back (Udemy)"],
  },
  {
    title: "Data Analyst",
    requiredSkills: ["python", "sql", "excel", "pandas", "tableau", "statistics"],
    courses: ["Google Data Analytics Certificate (Coursera)", "SQL for Data Science"],
  },
  {
    title: "AI / ML Engineer",
    requiredSkills: ["python", "machine learning", "tensorflow", "pytorch", "scikit-learn", "numpy"],
    courses: ["Machine Learning Specialization (Andrew Ng, Coursera)", "Deep Learning Specialization"],
  },
  {
    title: "DevOps Engineer",
    requiredSkills: ["docker", "kubernetes", "aws", "ci/cd", "linux", "git"],
    courses: ["Docker & Kubernetes: The Practical Guide (Udemy)", "AWS Certified DevOps Engineer"],
  },
  {
    title: "Mobile App Developer",
    requiredSkills: ["react native", "flutter", "kotlin", "swift", "javascript"],
    courses: ["React Native - The Practical Guide (Udemy)", "Flutter & Dart Bootcamp"],
  },
  {
    title: "QA / Test Engineer",
    requiredSkills: ["selenium", "testing", "cypress", "jest", "manual testing", "api testing"],
    courses: ["Selenium WebDriver with Java (Udemy)", "Test Automation University (free)"],
  },
];

export default jobRoles;

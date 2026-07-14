# Page Routes

Public Routes:

- / (Home page)
- /offline (Offline page)
- /feed (Feed page with tabs)
  - /feed/[tab] (Dynamic feed tab)
- /blogs/[blog] (Individual blog post)
- /projects/[project] (Individual project)

Authentication Routes:

- /[platform] (Platform auth - e.g., /vercel, /google, /github)
- /user-auth (User authentication)
  /user-auth/auth-mode (Login, OAuth, Password Retrieval, Sign Up)

User Routes (dynamic [username]):

- /[username] (User profile/dashboard)
- /[username]/blogs (User blogs)
  - /[username]/blogs/[blog] (View specific blog)
- /[username]/certification (User certifications)
- /[username]/education (User education)
- /[username]/experience (User experience)
  - /[username]/portfolios/[portfolio] (View specific portfolio)
- /[username]/projects (User projects)
  - /[username]/projects/[project] (View specific project)
  - /[username]/projects/[project]/collaborators (Project collaborators)
- /[username]/skills (User skills)
- /[username]/socials (User social links)
- /[username]/testimonials (User testimonials)
  - /[username]/testimonials/write (Write a testimonial)
  - /[username]/testimonials/[id] (View specific testimonial)

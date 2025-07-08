# TalentTrack
MERN Stack E-Learning Web App to improve communication skills

# TalentTrack – Dockerized Setup Guide

## Prerequisites:
- Docker Desktop installed and running
- Git (optional)

## How to Run the App

1. Open Docker Desktop
2. In terminal, go to the project folder
3. Run the following:

   docker-compose build
   docker-compose up

4. Access the system at:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## Notes:
- MongoDB data will persist using Docker volumes
- Uploaded files will be stored in the `uploads/` folder
- You can shut down with: `docker-compose down`

Default Credentials
Use these test accounts to explore the system functionality across different roles.
1. Admin Accounts:
- Email: newadmin@gmail.com  
- Password: nwead123
2. Evaluator Accounts:
- Email: eval1@gmail.com
- Password: evalPWDacc1
- Email: TestEval@gmail.com
- Password: teval123
3. Regular User Accounts:
- Email: awp@gmail.com
- Password: userACC123
- Email: td@gmail.com
- Password: td15DFGD

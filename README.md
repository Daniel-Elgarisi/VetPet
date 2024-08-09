## VetPet Application README

### Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Built With](#built-with)
4. [Installation](#installation)
5. [Usage](#usage)
6. [Configuration](#configuration)
7. [Contributing](#contributing)
8. [Database Setup](#database-setup)
9. [Contact](#contact)

### Introduction

VetPet is a comprehensive application intended for veterinary institutions and pet owners in Israel. It aims to bridge the gap in digital veterinary services by providing a comprehensive platform for pet health management. The application strengthens communication channels, centralizes health information, integrates proactive health management tools, and streamlines administrative processes. Key features include viewing visit summaries, managing appointments, payments, viewing receipts, tracking test results, vaccination records, viewing medications and prescriptions, referrals, and video calls with a veterinarian and more.

### Features

- **Pet Owners:**

  - **Pet Owners Menu:**

    - Secure Access
    - My Pet Owners Menu
    - Personal Details Management
    - My Appointments
    - Real-Time Alerts for:
      - Periodic Vaccinations
      - Upcoming Appointments
      - Payments
    - Manage Payments and Receipts
    - User Assistance Guide

  - **Each Pet Menu:**
    - My Profile
    - Appointments Management
    - Health Records:
      - Vaccinations
      - Test Results
      - Visit Summaries
      - Referrals
      - Medications and Prescriptions
    - Communication:
      - Chat with the Veterinary Institution
      - Video Call with a Veterinarian

- **Veterinarians:**
  - Secure Access
  - Manage Personal Details:
    - Update and View Profile
  - Communication:
    - Manage Video Calls with Pet Owners

### Built With

<table style="width: 100%; border-collapse: collapse;">
  <tr>
    <td style="border: none; text-align: center; padding: 10px;">
      <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
    </td>
    <td style="border: none; text-align: center; padding: 10px;">
      <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
    </td>
    <td style="border: none; text-align: center; padding: 10px;">
      <img src="https://img.shields.io/badge/React%20Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native">
    </td>
  </tr>
  <tr>
    <td style="border: none; text-align: center; padding: 10px;">
      <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js">
    </td>
    <td style="border: none; text-align: center; padding: 10px;">
      <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
    </td>
    <td style="border: none; text-align: center; padding: 10px;">
      <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo">
    </td>
  </tr>
  <tr>
    <td style="border: none; text-align: center; padding: 10px;">
      <img src="https://img.shields.io/badge/Android%20Studio-3DDC84?style=for-the-badge&logo=android-studio&logoColor=white" alt="Android Studio">
    </td>
    <td style="border: none; text-align: center; padding: 10px;">
      <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
    </td>
    <td style="border: none; text-align: center; padding: 10px;">
      <img src="https://img.shields.io/badge/Jenkins-D24939?style=for-the-badge&logo=jenkins&logoColor=white" alt="Jenkins">
    </td>
  </tr>
</table>

<!--
### Installation
1. **Clone the Repository:**
   ```bash
   git clone https://github.com/yourusername/vetpet.git
   cd vetpet
   ```
2. **Install Dependencies:**
   ```bash
   npm install
   ```
3. **Set Up Environment Variables:**
   Create a `.env` file in the root directory and add the necessary environment variables as specified in the `.env.example` file.

4. **Run the Application:**
   ```bash
   npm start
   ```

### Usage
1. **Starting the Application:**
   After completing the installation steps, start the application with `npm start`.
2. **Accessing the Application:**
   Open your browser and navigate to `http://localhost:3000` to access the VetPet application.
3. **Using the Features:**
   - **Client Management:** Add, edit, and delete client and pet information.
   - **Referrals:** Create new referrals and view existing ones.
   - **Photographs:** Upload and manage pet photographs.
   - **Veterinary Activities:** Track and manage all veterinary-related actions.
   - **Appointments and Payments:** Manage appointments and payments, including viewing receipts.
   - **Health Records:** Track vaccination records, medications, and prescriptions.
   - **Video Consultations:** Schedule and conduct video calls with veterinarians.

### Configuration
To configure the application, modify the environment variables in the `.env` file according to your setup. Key configuration options include:
- **Database Configuration:** Set up the database connection string.
- **API Keys:** Add necessary API keys for any third-party services used in the application.

### Contributing
We welcome contributions from the community! To contribute to VetPet, follow these steps:
1. **Fork the Repository:**
   Click on the "Fork" button at the top right corner of this repository page.
2. **Clone Your Fork:**
   ```bash
   git clone https://github.com/yourusername/vetpet.git
   cd vetpet
   ```
3. **Create a New Branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make Your Changes:**
   Implement your feature or bug fix.
5. **Commit and Push:**
   ```bash
   git add .
   git commit -m "Add your commit message here"
   git push origin feature/your-feature-name
   ```
6. **Create a Pull Request:**
   Go to the original repository and create a pull request from your fork.
-->

### Database Setup

To set up the database for the VetPet application, follow the instructions below.

#### Download the SQL Script

Here is the link to download the file:

[Download create_vetpet_database.sql](https://yourhostingservice.com/path/to/create_vetpet_database.sql)

#### How to Run the Script

To create the database using this script, the user can follow these steps:

1. **Open a terminal or command prompt**.

2. **Navigate to the directory where the `create_vetpet_database.sql` file is located**.

3. **Run the script using the following command**:

   ```bash
   psql -U [username] -d [database_name] -f create_vetpet_database.sql
   ```

   Replace `[username]` with the PostgreSQL username and `[database_name]` with the target database name.

4. **The script will execute and create the entire database schema**.

### Contact

For any questions or support, please contact us at [vetpetapplication@gmail.com].

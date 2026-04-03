# Flowshare

**Connecting your Desktop and Mobile, effortlessly.**

Welcome to Flowshare! This document is designed to give you a complete overview of what Flowshare is, the problem it solves, and how it was built, without getting deeply technical.

---

## The Problem

Have you ever had a photo, document, or video on your computer that you urgently needed on your phone or tablet? Or vice versa? 

Most people resort to frustrating workarounds:
- **Emailing files** to themselves (which has file size limits and is slow).
- **Using messaging apps** like WhatsApp or Telegram (which can compress and ruin the quality of photos/videos).
- **Hunting down a USB cable** to physically connect devices.

**Flowshare** was built to solve this exact problem. It is a seamless, fast, and unified platform to send files across your devices over the internet, completely hassle-free. Just upload, share, and download.

---

## How It Works & Where It Lives

Flowshare is available exactly where you need it. To make the experience as accessible as possible, it is split into a website and a mobile application.

### 1. The Web Application (Frontend)
The web version of Flowshare is what you use on your computer's browser. It allows you to drag-and-drop files quickly.
- **Where is it deployed?** You can visit the live website right here: [Flowshare Web](https://flowshare-frontend.onrender.com/)
- **Technology used:** It is built using **Next.js** (a modern web framework based on React) which ensures the website is incredibly fast and responsive. 

### 2. The Mobile App
Because a major part of the problem involves getting files *onto* a phone, I also built a dedicated mobile application for Flowshare!
- **Technology used:** It is built using **React Native**. This means the app feels like a true native app on your phone, providing a smooth, app-store quality experience for receiving and managing your files on the go.

### 3. The Engine (Backend)
To make the magic happen, there is a powerful "brain" running on a server in the cloud that securely handles the files as they travel between your computer and your phone.
- **Technology used:** The backend is built using modern server technologies (like **Node.js**) to manage file uploads, temporary storage, and secure delivery to the receiving user. It acts as the secure bridge holding everything together.

---

## 🛠️ The Journey: How I Made It

Building Flowshare required bridging the gap between different devices. 

1. **Designing the Vision:** I started by looking at how difficult it is for non-technical users to transfer files, and designed an interface that is as simple as "drag, drop, and send."
2. **Building the Web:** I used **Next.js** to create a stunning, easy-to-use website where users can upload their files instantly. I deployed this to a service called **Render** so it's live on the internet 24/7.
3. **Building the Mobile Experience:** To complete the ecosystem, I used **React Native** to create a companion mobile app. This allows your phone to talk natively to the backend server and receive the files you sent from your PC.
4. **Connecting the Dots:** Finally, the **Backend** was engineered to securely handle the heavy lifting of routing the files from the web app, over the cloud, and safely into your mobile app.

---

*Thank you for taking the time to learn about Flowshare! Enjoy sharing files seamlessly across all your devices.*

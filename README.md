# 🚀 Resume Screening Using NLP

An AI-powered Resume Screening System that automatically ranks candidates based on job description relevance using NLP techniques.

This project combines:

- ⚛️ React (Frontend)
- 🟢 Node.js + Express (Backend)
- 🐍 Python (ML Service)
- 🧠 NLP-based similarity scoring
- 🔥 AI-based Job Description summarization
- 📊 Resume ranking system

---

## 🏗️ Project Architecture
```
RESUMESCREENINGUSINGNLP/
├── frontend        # React Application
├── backend         # Node.js API Server
├── ml-service      # Python NLP Service
├── .github         # CI Configuration
└── README.md
```
---

## 🎯 Features

### ✅ Job Management
- Create job postings
- Upload job description (TXT / DOCX / PDF)
- Auto-extract required skills
- AI summarize job descriptions

### ✅ Resume Upload
- Upload multiple resumes per job
- Resume parsing via ML service

### ✅ AI Ranking System
- Generate ranking for each job
- NLP similarity scoring
- Score visualization with progress bars
- Shortlist / Reject candidates

### ✅ CI Integration
- GitHub Actions CI configured
- Frontend build validation
- Backend dependency check
- ML service dependency check

---

## 🧠 How Ranking Works

1. Job description is processed.
2. Required skills are extracted.
3. Resume text is parsed.
4. NLP similarity (TF-IDF / cosine similarity or model-based) is calculated.
5. Candidates are ranked based on match score.

---

## 🛠️ Tech Stack

### Frontend
- React
- Tailwind CSS
- Axios
- React Hot Toast

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication

### ML Service
- Python
- scikit-learn / spaCy
- Resume text extraction

---

## ⚙️ Local Setup

### 1️⃣ Setup Frontend
```bash
cd frontend
npm install
npm run dev
 ``` 
### 2️⃣ Setup Backend
```bash
 cd backend
npm install
npm start
```

### 3️⃣ Setup ML Service
```bash
cd ml-service
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py
```


### 🔐 Environment Variables

Create a .env file inside the backend folder:
```env
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
```
### 🔄 CI Pipeline

GitHub Actions automatically:

Installs frontend dependencies

Builds frontend

Installs backend dependencies

Installs Python ML dependencies

Workflow file located at:

```
.github/workflows/resume-screening-ci.yml
```

### 📌 Status

🚧 Currently under development
Not yet production deployed.



### 👩‍💻 Author

Built with ❤️ by Nayansi Dupare







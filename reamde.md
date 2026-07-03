#  Match My Resume

**Match My Resume** is an AI-powered resume optimization platform that helps job seekers tailor their resumes for specific job descriptions, improve ATS compatibility, prepare for technical interviews, and generate personalized cover letters.

Built using **React**, **FastAPI**, **LangChain**, **OpenRouter LLMs**, and **Sentence Transformers**, the platform combines traditional NLP techniques with Large Language Models to provide intelligent career assistance.

---

##  Features

###  Resume Analyzer
- Calculates an overall ATS compatibility score.
- Extracts and compares resume skills with job description requirements.
- Displays:
  - Overall Match Score
  - Matched Skills
  - Missing Skills
  - Extra Skills
- Uses semantic similarity to compare:
  - Resume projects with job responsibilities
  - Resume experience with job responsibilities
- Generates an AI-powered report including:
  - Resume summary
  - Strengths
  - Weaknesses
  - Suggested improvements

---

###  Resume Rewriter
Rewrites only the **Projects** and **Experience** sections to better align with a target job description while:

- Preserving the original meaning
- Never inventing technologies or achievements
- Using stronger action verbs
- Improving ATS keyword optimization

---

###  AI Mock Interview

Generates technical interview questions based on:

- Resume
- Job Description
- Skill Gaps

Supports:

- Resume-focused interview
- JD-focused interview
- Gap-focused interview
- Complete interview mode

Each question includes a difficulty level:

- 🟢 Easy
- 🟡 Medium
- 🔴 Hard

The platform evaluates every submitted answer individually and provides:

- Score
- Strengths
- Weaknesses
- Missing discussion points

---

###  Cover Letter Generator

Generates personalized cover letters by combining:

- Resume
- Job Description
- Company Name
- Desired writing tone

The generated cover letter:

- Highlights relevant experience
- Uses ATS-friendly language
- Never invents qualifications
- Maintains a professional structure

---

##  Tech Stack

### Frontend

- React
- React Router
- Tailwind CSS
- Axios
- Vite

### Backend

- FastAPI
- LangChain
- OpenRouter API
- Sentence Transformers
- Scikit-learn
- Pydantic

### AI Models

- Qwen 3.5
- Mistral Small
- all-MiniLM-L6-v2 (Sentence Transformers)

---

##  Project Structure

```text
Match-My-Resume
│
├── frontend
│   ├── src
│   ├── public
│   └── package.json
│
├── backend
│   ├── services
│   ├── routers
│   ├── app.py
│   ├── requirements.txt
│   └── .env
│
└── README.md
```

---

##  Installation

### Clone the repository

```bash
git clone https://github.com/ItsTanseer/Match_My_Resume
cd Match-My-Resume
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Runs on:

```
http://localhost:5173
```

---

## Backend Setup

Create a virtual environment:

```bash
cd backend

python -m venv venv
```

Activate it:

Windows

```bash
venv\Scripts\activate
```

Linux/Mac

```bash
source venv/bin/activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Create a `.env`

```env
OPEN_ROUTER_API_KEY=your_api_key
```

Run FastAPI

```bash
uvicorn app:app --reload
```

Backend runs on

```
http://localhost:8000
```

---

## 🔗 API Endpoints

| Endpoint | Description |
|-----------|-------------|
| `/analyze` | Resume ATS Analysis |
| `/rewrite` | Resume Rewriter |
| `/mockinterview` | Generate Interview Questions |
| `/evaluateanswer` | Evaluate Interview Answers |
| `/coverletter` | Generate Cover Letter |

---

##  How ATS Score is Calculated

The overall ATS score combines multiple factors:

- Keyword Match Score
- Semantic Similarity of Experience
- Semantic Similarity of Projects
- AI-generated Resume Analysis

This provides a more context-aware evaluation compared to simple keyword matching.

---





##  Future Improvements

- Resume Version History
- RAG-based Resume Retrieval
- Multiple Resume Management
- PDF Resume Export
- Voice-based AI Interview
- Authentication
- Dashboard Analytics
- Company-specific Resume Templates

---

##  Author

**Tanseer Ahmad**

- GitHub: https://github.com/ItsTanseer
- LinkedIn: https://www.linkedin.com/in/tanseer-ahmad/

---

##  License

This project is licensed under the MIT License.
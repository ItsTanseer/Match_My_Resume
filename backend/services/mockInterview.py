import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel, Field
from fastapi import APIRouter
from typing import Literal
router = APIRouter()
load_dotenv()
api_key = os.getenv("OPEN_ROUTER_API_KEY")

model = ChatOpenAI(model="qwen/qwen3.5-9b",
                   base_url = "https://openrouter.ai/api/v1",
                   api_key = api_key)


class MockInterviewInput(BaseModel):
    resume:str
    jd:str
    numqns:int

class Question(BaseModel):
    question:str
    difficulty: Literal[0,1,2]

class MockInterviewOP(BaseModel):
    resume_qns:list[Question] = Field(description="Interview questions(technical) based on the resume")
    jd_qns:list[Question] = Field(description="Interview questions (technical) based on the job desriptions")
    gap_qns:list[Question] = Field(description="Gap questions")


prompt = PromptTemplate(
    template="""You are an experienced technical interviewer.

Generate interview questions based on the candidate's resume and the target job description.

Generate exactly {n} questions for each category.

Categories:

1. Resume-based Technical Questions
- Questions should come directly from the candidate's projects and work experience.
- Ask about implementation decisions, architecture, technologies used, challenges, scalability, and improvements.
- Do NOT ask generic textbook questions unless they relate to the candidate's experience.
-DO NOT ask questions about the topics, concepts, implementaion details not mentioned in the resume


2. Job Description Technical Questions
- Generate questions covering the important technologies, frameworks, and concepts mentioned in the job description.
- The questions should evaluate whether the candidate is prepared for this specific role.
- DO NOT include questions of topics not in the job description
3. Gap Questions
- Compare the resume with the job description.
- Generate questions only about important skills required by the job description that are missing from the resume.
- If there are no significant missing skills, return an empty list.

For each question return the question's difficulty as - 0: Easy,  1: Medium, 2: Hard
 


Rules:
- Questions must be unique.
- Do not repeat the same concept across categories.
- Do not include answers.
- Return the questions only in the required structured format.


Resume:
{resume}

Job Description:
{jd}""",
    input_variables=['n', 'resume', 'jd'])
@router.post('/mockinterview')
async def getMockInterview(data:MockInterviewInput ):
    structured_model = model.with_structured_output(MockInterviewOP)
    response = await structured_model.ainvoke(prompt.format(n=data.numqns, resume=data.resume, jd = data.jd))
    return response

import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel, Field
from fastapi import APIRouter
router = APIRouter()
load_dotenv()
api_key = os.getenv("OPEN_ROUTER_API_KEY")

model = ChatOpenAI(model="mistralai/mistral-small-3.2-24b-instruct",
                   base_url = "https://openrouter.ai/api/v1",
                   api_key = api_key,
                   temperature=0.1,
                   )

class CoverLetterInput(BaseModel):
    resume:str
    jd:str
    company:str | None=None
    tone:str

prompt = PromptTemplate(
    template="""
    You are an expert career coach and professional resume writer.

Write a personalized cover letter based on the candidate's resume and the target job description.

Company:
{company}

Resume:
{resume}

Job Description:
{jd}

Rules:

1. Maximum 350 words.
2. Tone- {tone}.
3. Mention the company naturally if provided.
4. Explain why the candidate is interested in the role.
5. Highlight ONLY relevant experience from the resume.
6. Never invent skills, projects, achievements or years of experience.
7. Naturally mention technologies that overlap with the job description.
8. End with a professional closing paragraph.
9. Return only the cover letter.""",
    input_variables=['company', 'resume', 'jd', 'tone']
    )
@router.post('/coverletter')
async def getCoverLetter(data:CoverLetterInput):
    response = await model.ainvoke(prompt.format(company=data.company, resume=data.resume, jd = data.jd, tone = data.tone))
    result = response.content
    result = result.replace('*', "")

    return result


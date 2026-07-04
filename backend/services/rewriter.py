import os
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
from sklearn.metrics.pairwise import cosine_similarity
from pydantic import BaseModel, Field
from langchain_core.prompts import PromptTemplate
import numpy as np
import asyncio
from fastapi import APIRouter
router = APIRouter()
load_dotenv()
api_key = os.getenv("OPEN_ROUTER_API_KEY")

llm = ChatOpenAI(model="qwen/qwen3.5-9b",
                   base_url = "https://openrouter.ai/api/v1",
                   api_key = api_key)

class RewriteInput(BaseModel):
    resume:str
    jd:str
class Projects(BaseModel):
    title:str = Field(description="title of the project")
    bullets: list[str] = Field(description="updated bullet points of the projects to improve ATS score")
class Experience(BaseModel):
    company:str
    role:str
    bullets:list[str] = Field(description="list of updated details of experience.")
class RewriteSchema(BaseModel):
    project:list[Projects] = Field(description="list of rewritten projects in a better way to improve ATS score")
    experience:list[Experience] = Field(description="list of rewritten experiences in a better way to improve ATS score")


prompt = PromptTemplate(
    template="""You are an expert ATS resume optimizer.

Your task is to rewrite ONLY the bullet points of the projects and experience sections to better align with the provided job description.

Resume:
{resume}

Job Description:
{jd}

Rules:

1. Keep the original meaning unchanged.
2. Never invent experience, technologies, achievements, numbers, or responsibilities.
3. Preserve the same number of projects and experience entries.
5. Use stronger action verbs and more professional wording.
6. Naturally emphasize technologies already present in the bullet if they are relevant to the job description.
7. Each rewritten bullet must be at most 35 words.
8. Do NOT rewrite education, certifications, or skills.
9. Return only the rewritten Projects and Experience sections in the required structured format.
""",
    input_variables=['resume', 'jd'])


@router.post('/rewrite')
async def rewrite(data:RewriteInput):  
    structured_model = llm.with_structured_output(RewriteSchema)
    response = await structured_model.ainvoke(prompt.format(resume=data.resume, jd=data.jd))
    print(response)
    return response

import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel, Field
load_dotenv()
api_key = os.getenv("OPEN_ROUTER_API_KEY")

model = ChatOpenAI(model="mistralai/mistral-small-3.2-24b-instruct",
                   base_url = "https://openrouter.ai/api/v1",
                   api_key = api_key)

class ResumeOP(BaseModel):
        """List of skills extracted from resume"""
        skills: list[str] = Field(description="A list of skills in a string list")

class JDSkillsOP(BaseModel):
        """List of skills extracted from job description"""
        skills:list[str] = Field(description="list of skills extracted from job description")
async def getresumeSkills(resumeText:str):

    promptResume= PromptTemplate(
    template="From this resume extract all the skills. Resume- {resume} ",
    input_variables=['resume']
    )
    promptfinal =  await promptResume.ainvoke({'resume': resumeText})
    modelResume = model.with_structured_output(ResumeOP)

    resumeSkills =  await modelResume.ainvoke(promptfinal)
    return resumeSkills.skills

async def getJDSkills(jd:str):
    promptJD = PromptTemplate(
    template="""You are an ATS parser.

        Extract ONLY explicitly mentioned technologies,
        programming languages, frameworks, libraries,
        databases, cloud platforms, tools and certifications.

        Rules:

        1. Do NOT extract responsibilities.
        2. Do NOT extract soft skills.
        3. Do NOT extract concepts like:
        - Teamwork
        - Communication
        4. Only return technologies that appear literally in the text.

        Examples:

        Input:
        Experience with Python, FastAPI and Docker.

        Output:
        ["Python","FastAPI","Docker"]

        Input:
        Responsible for troubleshooting software.

        Output:
        []

        . Job description = {jd}""",
        input_variables=['jd']
        )
    final_prompt = await promptJD.ainvoke({'jd':jd})
    modelJD = model.with_structured_output(JDSkillsOP)
    JDSkills  = await modelJD.ainvoke(final_prompt)
    return JDSkills.skills

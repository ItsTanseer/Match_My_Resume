import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel, Field
load_dotenv()
api_key = os.getenv("OPEN_ROUTER_API_KEY")

model = ChatOpenAI(model="mistralai/mistral-small-3.2-24b-instruct",
                   base_url = "https://openrouter.ai/api/v1",
                   api_key = api_key,
                   temperature=0.1,
                   )

class ReportOP(BaseModel):
    review: str = Field(description="Summary of overall assesment of the resume.")
    strengths: list[str] = Field(description="list of strengths in the resume, i.e. strong aspects of the resume")
    weaknesses: list[str] = Field(description="list of weak aspects of the resume")
   
    improvements:list[str] = Field(description="List of imrovements that can be made the the resume to make it more fit for the job description")
class getReportInput(BaseModel):
    job_title:str
    matched_skills: list[str]
    missing_skills: list[str]
    extra_skills: list[str]
    match_score: float

async def getreport(data: getReportInput):
    prompt = PromptTemplate(
        template="""You are a professional ATS report generator and resume evaluator expert.
        
         Job title: {job_title}
        matched skills: {matchedSkills}, missing skills- {missingSkills}, extra skills on the resume but not in the job description- {extraSkills}, skill match score (in percentage)- {matchScore}. Based on the given inputs and job title,  generate a report and include- 1. review(general summary of the resume, maxiumum 75 words), 2. strengths, 3. weaknesses,  4. improvments that can be made to the resume
        Rules: 1. DO NOT USE MARKDOWN
        2. Each element of list should be plain text
        3. maximum 10 improvemets, one sentence each
        4. maximum 10 weaknesses, one sentence each
        
        """,
        input_variables=['job_title', 'matchedSkills', 'missingSkills', 'extraSkills', 'matchScore'])
    # print(data.matched_skills)
    # print(data.missing_skills)
    # print(data.extra_skills)
    # print(data.match_score)
    finalPrompt =  prompt.invoke({'job_title':data.job_title, 'matchedSkills':data.matched_skills, 'missingSkills':data.missing_skills, 'extraSkills':data.extra_skills, 'matchScore':data.match_score})

    reportModel = model.with_structured_output(ReportOP)
    report= await reportModel.ainvoke(finalPrompt)
    return report
import pymupdf
import os
from fastapi import FastAPI, UploadFile, File, Form
from pydantic import ValidationError
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from services.semanticSearch import generateSemanticScore
from services.rewriter import router
from services.skillExtractor import getresumeSkills, getJDSkills
from services.getReport import getreport
from services.getReport import getReportInput
from services.mockInterview import router as MockInterviewRouter
from services.evaluateMockInterview import router as evaluateQuestion
from services.coverletter import router as getCoverLetter
load_dotenv()
from fastapi.middleware.cors import CORSMiddleware

api_key = os.getenv("OPEN_ROUTER_API_KEY")

model = ChatOpenAI(model="google/gemma-3-12b-it",
                   base_url = "https://openrouter.ai/api/v1",
                   api_key = api_key)
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
            "https://match-my-resume-ten.vercel.app/analyzer",
            "https://match-my-resume-ten.vercel.app",
            "https://match-my-resume-ten.vercel.app/"
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
app.include_router(router)
app.include_router(MockInterviewRouter)
app.include_router(evaluateQuestion)
app.include_router(getCoverLetter)
print("Server Running")








@app.post('/analyze')
async def analyzeResume(
    resumeFile: UploadFile = File(...),
    jd: str = Form(...),
    job_title:str = Form(...)
    ):
    

    

    pdf_bytes = await resumeFile.read()
    doc =  pymupdf.open(stream=pdf_bytes, filetype="pdf")
    text=[]
    for page in doc:
        text.append(page.get_text())
    resumeText=".\n\n".join(text)

    
    resumeSkills = await getresumeSkills(resumeText)
    JDSkills = await getJDSkills(jd)
 


    def normalize(skill:str)->str:
        skill=skill.lower()
        skill=skill.replace(".", "")
        skill = skill.replace(",", "")
        skill = skill.replace("/", "")
        skill = skill.replace("-", "")
        skill = skill.replace("_", "")
        skill = skill.strip()
        return skill
    
    resume_set = {normalize(skill) for skill in resumeSkills}
    jd_set =  {normalize(skill) for skill in JDSkills}
    # print(jd_set)
    # print(resume_set)
    common_skills = resume_set.intersection(jd_set)
    missing_skills = jd_set.difference(resume_set)
    extra_skills = resume_set.difference(jd_set)
    print("matched skills- " ,common_skills)
    print("missing skills- ", missing_skills)
    score=(round(len(common_skills)/len(jd_set)*100, 2) if len(jd_set)!=0 else 0)
    print(score)
    try:
        report = await getreport(getReportInput(
                matched_skills=common_skills,
                missing_skills=missing_skills,
                extra_skills = extra_skills,
                match_score=score,
                job_title=job_title
            )
                )
    except ValidationError:
        report = "Report could not be generated. It is a model issue. Try again later"
    print(report)

    #FOR TRIAL PURPOSE
    # await getreport(getReportInput(
    #             matched_skills=common_skills,
    #             missing_skills=missing_skills,
    #             extra_skills = extra_skills,
    #             match_score=score,
    #             job_title=job_title
    #          )
    #             )
    semantic_scores = await generateSemanticScore(resumeSkills, JDSkills, resumeText, jd)
    experience_score = semantic_scores["experience_and_responsibility_Score"]
    context_score = semantic_scores["context_score"]
    skill_semantic = semantic_scores["skillsemanticscore"]
    final_score = float(round(
        (
        0.45*score +
       0.1*skill_semantic+
        0.2*experience_score + 
        0.25*context_score
        ), 2))
        
    print("ATS- ", final_score)
    return {
            "matched_skills":common_skills,
            "match_score":score,
            "missing_skills":missing_skills,
            "extra_skills":extra_skills,
            "report":report,
            "semantic_scores":{
                "project":context_score,
                "experience":experience_score
                },
            "Overall":final_score
             
        }




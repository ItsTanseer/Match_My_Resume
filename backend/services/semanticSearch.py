import os
from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from pydantic import BaseModel, Field
from langchain_core.prompts import PromptTemplate
import numpy as np
import asyncio
load_dotenv()
api_key = os.getenv("OPEN_ROUTER_API_KEY")

llm = ChatOpenAI(model="qwen/qwen3.5-9b",
                   base_url = "https://openrouter.ai/api/v1",
                   api_key = api_key)

class ResumeAnalysis(BaseModel):
    projects: list[str] = Field(description="List of short summary of projects extracted from the resume")
    experience: list[str] = Field(description="list of short summary of experience from resume")

class JDAnalisys(BaseModel):
    responsibilities: list[str] = Field(description="list of expected responsibilities from the job description")



import numpy as np

def normalize_score(raw_cosine_score: float) -> float:
    lower_bound = 0.15 # Minimum threshold )
    upper_bound = 0.55 # Excellent match threshold 
    scaled = (raw_cosine_score - lower_bound) / (upper_bound - lower_bound) * 100
    
    return float(max(0, min(100, scaled)))

def get_best_match_score(scores_array) -> float:
    best_score = scores_array.max()
    return normalize_score(best_score)

model = SentenceTransformer("all-MiniLM-L6-v2")
promptProjects = PromptTemplate(
    template="""Extract the short summary of each project, and short summaries of each experience from the projects section and experience section of the resume respectively. Resume- {resume}.
    Node- Summary of each project should be maximum 3 lines,
    Summary of each experience should be maximum 3 lines""",
    input_variables=['resume'])

promptResponsibilities = PromptTemplate(
    template="""Extract a list of summaries of responsibilites from the job description. Job description- {jd}.
    Note- Each responsibility's summary should be maximum 3 lines""",
    input_variables=['jd'])



async def generateSemanticScore(resumeSkills:list[str], jdSkills:list[str],resumeText:str, jdText:str):
   
    modelResume = llm.with_structured_output(ResumeAnalysis)
    modelJD = llm.with_structured_output(JDAnalisys)
    project_task  =   modelResume.ainvoke(promptProjects.format(resume=resumeText))
    responsibility_task =   modelJD.ainvoke(promptResponsibilities.format(jd=jdText))

    projects_and_experience,responsibilities  = await  asyncio.gather(
            project_task, responsibility_task
        )
    projects = projects_and_experience.projects
    experience = projects_and_experience.experience

    

    # print(responsibilities)
    print(responsibilities.responsibilities)
    # print(type(responsibilities.responsibilities))
    # print(type(responsibilities.responsibilities[0]))
    resumeSkillEmbeddings =  model.encode(resumeSkills)
    jdSkillsEmbeddings =   model.encode(jdSkills)
    responsibilitiesEmbeddings = model.encode(responsibilities.responsibilities)
    experienceEmbeddings=model.encode(experience)
    experieceResponsibilityScore = get_best_match_score(
         cosine_similarity( experienceEmbeddings, responsibilitiesEmbeddings).max(axis=1)
        )
    projectEmbeddings =  model.encode(projects)

   

    
    skillScore =cosine_similarity(
        resumeSkillEmbeddings,
        jdSkillsEmbeddings).max(axis=1)
    
    
    
    contextScore = get_best_match_score(cosine_similarity(
        projectEmbeddings,
        responsibilitiesEmbeddings
        ).max(axis=1))
    
    
    return {
            "skillsemanticscore":float(skillScore.mean()*100),
            "experience_and_responsibility_Score":float(experieceResponsibilityScore),
            "context_score":float(contextScore)
        }


    

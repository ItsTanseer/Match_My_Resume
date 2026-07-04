import os
import numpy as np
import asyncio
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI, OpenAIEmbeddings 
from sklearn.metrics.pairwise import cosine_similarity
from pydantic import BaseModel, Field
from langchain_core.prompts import PromptTemplate

load_dotenv()

openrouter_api_key = os.getenv("OPEN_ROUTER_API_KEY")

llm = ChatOpenAI(
    model="qwen/qwen3.5-9b",
    base_url="https://openrouter.ai/api/v1",
    api_key=openrouter_api_key
)

embedding_model = OpenAIEmbeddings(
    model="text-embedding-3-small",
    api_key=openrouter_api_key
)

class ResumeAnalysis(BaseModel):
    projects: list[str] = Field(description="List of short summary of projects extracted from the resume")
    experience: list[str] = Field(description="list of short summary of experience from resume")

class JDAnalisys(BaseModel):
    responsibilities: list[str] = Field(description="list of expected responsibilities from the job description")

def normalize_score(raw_cosine_score: float) -> float:
    lower_bound = 0.15 # Minimum threshold 
    upper_bound = 0.55 # Excellent match threshold 
    scaled = (raw_cosine_score - lower_bound) / (upper_bound - lower_bound) * 100
    
    return float(max(0, min(100, scaled)))

def get_best_match_score(scores_array) -> float:
    best_score = scores_array.max()
    return normalize_score(best_score)

promptProjects = PromptTemplate(
    template="""Extract the short summary of each project, and short summaries of each experience from the projects section and experience section of the resume respectively. Resume- {resume}.
    Node- Summary of each project should be maximum 3 lines,
    Summary of each experience should be maximum 3 lines""",
    input_variables=['resume']
)

promptResponsibilities = PromptTemplate(
    template="""Extract a list of summaries of responsibilites from the job description. Job description- {jd}.
    Note- Each responsibility's summary should be maximum 3 lines""",
    input_variables=['jd']
)

async def generateSemanticScore(resumeSkills:list[str], jdSkills:list[str], resumeText:str, jdText:str):
    
    modelResume = llm.with_structured_output(ResumeAnalysis)
    modelJD = llm.with_structured_output(JDAnalisys)
    
    project_task = modelResume.ainvoke(promptProjects.format(resume=resumeText))
    responsibility_task = modelJD.ainvoke(promptResponsibilities.format(jd=jdText))

    projects_and_experience, responsibilities = await asyncio.gather(
        project_task, responsibility_task
    )
    
    projects = projects_and_experience.projects
    experience = projects_and_experience.experience

    resumeSkillEmbeddings = np.array(embedding_model.embed_documents(resumeSkills))
    jdSkillsEmbeddings = np.array(embedding_model.embed_documents(jdSkills))
    responsibilitiesEmbeddings = np.array(embedding_model.embed_documents(responsibilities.responsibilities))
    experienceEmbeddings = np.array(embedding_model.embed_documents(experience))
    projectEmbeddings = np.array(embedding_model.embed_documents(projects))

    experieceResponsibilityScore = get_best_match_score(
        cosine_similarity(experienceEmbeddings, responsibilitiesEmbeddings).max(axis=1)
    )

    skillScore = cosine_similarity(
        resumeSkillEmbeddings,
        jdSkillsEmbeddings
    ).max(axis=1)
    
    contextScore = get_best_match_score(
        cosine_similarity(projectEmbeddings, responsibilitiesEmbeddings).max(axis=1)
    )
    
    return {
        "skillsemanticscore": float(skillScore.mean() * 100),
        "experience_and_responsibility_Score": float(experieceResponsibilityScore),
        "context_score": float(contextScore)
    }
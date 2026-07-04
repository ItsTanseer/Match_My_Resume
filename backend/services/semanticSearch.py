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
    model="openai/text-embedding-3-small",
    api_key=openrouter_api_key,
    base_url="https://openrouter.ai/api/v1"
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

async def generateSemanticScore(
    resumeSkills: list[str],
    jdSkills: list[str],
    resumeText: str,
    jdText: str,
):

    modelResume = llm.with_structured_output(ResumeAnalysis)
    modelJD = llm.with_structured_output(JDAnalisys)

    project_task = modelResume.ainvoke(
        promptProjects.format(resume=resumeText)
    )

    responsibility_task = modelJD.ainvoke(
        promptResponsibilities.format(jd=jdText)
    )

    projects_and_experience, responsibilities = await asyncio.gather(
        project_task,
        responsibility_task,
    )

    projects = projects_and_experience.projects or ["No projects"]
    experience = projects_and_experience.experience or ["No experience"]
    responsibility_list = responsibilities.responsibilities or ["No responsibilities"]

    resumeSkills = resumeSkills or ["None"]
    jdSkills = jdSkills or ["None"]

    # -------- SINGLE EMBEDDING API CALL --------

    all_text = (
        resumeSkills
        + jdSkills
        + responsibility_list
        + experience
        + projects
    )

    embeddings = np.array(
        embedding_model.embed_documents(all_text)
    )

    # -------- Split embeddings back --------

    idx = 0

    resumeSkillEmbeddings = embeddings[idx: idx + len(resumeSkills)]
    idx += len(resumeSkills)

    jdSkillsEmbeddings = embeddings[idx: idx + len(jdSkills)]
    idx += len(jdSkills)

    responsibilitiesEmbeddings = embeddings[
        idx: idx + len(responsibility_list)
    ]
    idx += len(responsibility_list)

    experienceEmbeddings = embeddings[
        idx: idx + len(experience)
    ]
    idx += len(experience)

    projectEmbeddings = embeddings[idx:]

    # -------- Similarity Scores --------

    experienceResponsibilityScore = get_best_match_score(
        cosine_similarity(
            experienceEmbeddings,
            responsibilitiesEmbeddings,
        ).max(axis=1)
    )

    skillScore = cosine_similarity(
        resumeSkillEmbeddings,
        jdSkillsEmbeddings,
    ).max(axis=1)

    contextScore = get_best_match_score(
        cosine_similarity(
            projectEmbeddings,
            responsibilitiesEmbeddings,
        ).max(axis=1)
    )

    return {
        "skillsemanticscore": float(skillScore.mean() * 100),
        "experience_and_responsibility_Score": float(experienceResponsibilityScore),
        "context_score": float(contextScore),
    }
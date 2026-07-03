import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from pydantic import BaseModel, Field
from fastapi import APIRouter
from typing import Annotated, Literal
router = APIRouter()
load_dotenv()
api_key = os.getenv("OPEN_ROUTER_API_KEY")

model = ChatOpenAI(model="qwen/qwen3.5-9b",
                   base_url = "https://openrouter.ai/api/v1",
                   api_key = api_key)

class InterviewInput(BaseModel):
    question:str
    answer:str
class InterviewOutput(BaseModel):
    score:float = Field(description="Overall score of the answer out of 100")
    weaknesses:list[str] = Field(description="Small list of weak points(if any) in the answer")
    missing_points:list[str] = Field(description="Important points that should have been mentioned in the answer")
    
prompt = PromptTemplate(
    template="""
    You are an experienced software engineering interviewer.

question- {question}
answer- {answer}
Evaluate the candidate's answer.

Scoring Criteria:

1. Technical correctness
2. Completeness
3. Clarity
4. Practical understanding


Rules:
- Score should be an integer between 0-100
- Do not penalize for wording or grammar.
- Evaluate only technical quality.
- If the answer is partially correct, explain what is missing.
- The candidate is not a professional senior, he's a just passed out college student so dont expect extremely professional answers
- Return a list of weak points of the answer that could be improved with small explaination. 2-3 lines max. If there are no significant week points, return empty list
- Return a list of missing points from the answer that should have been in the answer. If no significant points are missing return empty list
    """,
    input_variables=['question', 'answer'])

@router.post('/evaluateinterview')
async def evaluateQuestion(data:InterviewInput):
    structrued_model = model.with_structured_output(InterviewOutput)
    response  = await structrued_model.ainvoke(prompt.format(question=data.question, answer = data.answer))
    return response
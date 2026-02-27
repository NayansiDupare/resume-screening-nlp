from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Load model once (global)
model = SentenceTransformer("all-MiniLM-L6-v2")


def get_similarity_scores(job_text: str, resume_texts: list):
    """
    Returns cosine similarity scores between job description
    and list of resumes using Transformer embeddings.
    """

    if not job_text or not resume_texts:
        return []

    # Combine JD + resumes
    all_texts = [job_text] + resume_texts

    # Generate embeddings
    embeddings = model.encode(all_texts, convert_to_numpy=True)

    job_embedding = embeddings[0]
    resume_embeddings = embeddings[1:]

    scores = []

    for resume_embedding in resume_embeddings:
        similarity = cosine_similarity(
            [job_embedding],
            [resume_embedding]
        )[0][0]

        scores.append(float(round(similarity, 4)))

    return scores

import requests
from datetime import datetime
import os


def extract_github_username(url: str):
    try:
        if "github.com/" not in url:
            return None
        return url.rstrip("/").split("github.com/")[1].split("/")[0]
    except:
        return None


def analyze_github_profile(github_url: str):
    username = extract_github_username(github_url)

    if not username:
        return {"github_positive_score": 0, "penalties": {}}

    headers = {}
    token = os.getenv("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"

    try:
        user_resp = requests.get(
            f"https://api.github.com/users/{username}",
            headers=headers
        )

        repos_resp = requests.get(
            f"https://api.github.com/users/{username}/repos?per_page=100",
            headers=headers
        )

        if user_resp.status_code != 200 or repos_resp.status_code != 200:
            return {"github_positive_score": 0, "penalties": {}}

        repos = repos_resp.json()

        repo_count = len(repos)
        forked_repos = sum(1 for r in repos if r.get("fork"))
        original_repos = repo_count - forked_repos

        recent_active_repos = 0
        readme_missing_count = 0
        tutorial_like_count = 0
        total_commits_checked = 0

        now = datetime.utcnow()

        positive_score = 0
        penalties = {}

        for repo in repos:
            # Recent Activity
            pushed_at = repo.get("pushed_at")
            if pushed_at:
                pushed_date = datetime.strptime(
                    pushed_at, "%Y-%m-%dT%H:%M:%SZ"
                )
                if (now - pushed_date).days < 180:
                    recent_active_repos += 1

            # README check
            readme_resp = requests.get(
                f"https://api.github.com/repos/{username}/{repo['name']}/readme",
                headers=headers
            )
            if readme_resp.status_code != 200:
                readme_missing_count += 1

            # Tutorial detection (basic keyword logic)
            name_lower = repo["name"].lower()
            if any(keyword in name_lower for keyword in [
                "tutorial", "demo", "practice", "clone"
            ]):
                tutorial_like_count += 1

        # ----------------------------
        # POSITIVE SCORING
        # ----------------------------

        if repo_count >= 10:
            positive_score += 8
        elif repo_count >= 5:
            positive_score += 5
        elif repo_count >= 1:
            positive_score += 3

        if original_repos >= 5:
            positive_score += 5
        elif original_repos >= 2:
            positive_score += 3

        if recent_active_repos >= 5:
            positive_score += 5
        elif recent_active_repos >= 2:
            positive_score += 3

        # ----------------------------
        # PENALTIES
        # ----------------------------

        # Only forked repos
        if repo_count > 0 and forked_repos == repo_count:
            penalties["only_forked_repositories"] = -10

        # No original projects
        if original_repos == 0:
            penalties["no_original_projects"] = -8

        # No recent commits
        if recent_active_repos == 0:
            penalties["no_recent_activity"] = -7

        # Most repos missing README
        if readme_missing_count > (repo_count * 0.6):
            penalties["most_projects_missing_readme"] = -5

        # Mostly tutorial projects
        if tutorial_like_count > (repo_count * 0.5):
            penalties["mostly_tutorial_projects"] = -6

        return {
            "repo_count": repo_count,
            "forked_repos": forked_repos,
            "original_repos": original_repos,
            "recent_active_repos": recent_active_repos,
            "readme_missing_count": readme_missing_count,
            "tutorial_like_projects": tutorial_like_count,
            "github_positive_score": positive_score,
            "penalties": penalties
        }

    except Exception:
        return {"github_positive_score": 0, "penalties": {}}

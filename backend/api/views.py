from rest_framework.decorators import api_view
from rest_framework.response import Response
import uuid, os, base64, requests
from dotenv import load_dotenv

load_dotenv()

@api_view(['POST'])
def submit_code(request):
    code = request.data.get("code")
    language = request.data.get("language")
    os_choice = request.data.get("os")

    run_id = str(uuid.uuid4())
    ext_map = {"python": "py", "cpp": "cpp", "java": "java"}
    file_ext = ext_map[language]
    filename = f"{run_id}.{file_ext}"  # unique filename

    # Save file locally
    local_dir = f"/tmp/{run_id}/code"
    os.makedirs(local_dir, exist_ok=True)
    local_path = os.path.join(local_dir, filename)

    with open(local_path, "w") as f:
        f.write(code)

    # Load GitHub credentials
    GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
    GITHUB_REPO = os.getenv("GITHUB_REPO")
    GITHUB_BRANCH = os.getenv("GITHUB_BRANCH", "main")

    # Push file to GitHub under: code/python/filename
    github_path = f"code/{language}/{filename}"
    commit_message = f"Add {filename} via Runner H"

    with open(local_path, "rb") as f:
        encoded_content = base64.b64encode(f.read()).decode()

    headers = {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }

    github_api_url = f"https://api.github.com/repos/{GITHUB_REPO}/contents/{github_path}"

    # Optional: Check if file exists to update SHA
    sha = None
    check = requests.get(github_api_url, headers=headers)
    if check.status_code == 200:
        sha = check.json().get("sha")

    payload = {
        "message": commit_message,
        "content": encoded_content,
        "branch": GITHUB_BRANCH
    }
    if sha:
        payload["sha"] = sha

    # Push file to GitHub
    response = requests.put(github_api_url, headers=headers, json=payload)

    if response.status_code not in [200, 201]:
        return Response({
            "error": "GitHub push failed",
            "details": response.json()
        }, status=500)

    # Trigger Runner H (GitHub Actions workflow_dispatch)
    workflow_dispatch_url = f"https://api.github.com/repos/{GITHUB_REPO}/actions/workflows/run_code.yml/dispatches"

    workflow_payload = {
        "ref": GITHUB_BRANCH,
        "inputs": {
            "language": language,
            "os": os_choice,
            "filename": filename
        }
    }

    dispatch_headers = {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json"
    }

    workflow_response = requests.post(workflow_dispatch_url, headers=dispatch_headers, json=workflow_payload)

    if workflow_response.status_code != 204:
        return Response({
            "error": "Failed to trigger Runner H GitHub Actions",
            "details": workflow_response.json()
        }, status=500)

    return Response({
        "run_id": run_id,
        "filename": filename,
        "language": language,
        "os": os_choice,
        "message": " Code pushed and Runner H workflow triggered!"
    })

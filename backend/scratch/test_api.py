import urllib.request
import json
import os

url = 'http://127.0.0.1:5000/api/analyze-resume'

# Test 1: JSON text endpoint
print("=" * 50)
print("TEST 1: JSON Text Endpoint")
print("=" * 50)
payload = {
    'resume_text': 'RAHUL KUMAR\nEmail: rahul@gmail.com\nEDUCATION\nB.Tech CSE CGPA: 8.5\nEXPERIENCE\nIntern at Tech\nPROJECTS\nApp built with Java\nSKILLS\nJava, SQL, Git',
    'target_role': 'Java Developer'
}
req = urllib.request.Request(url, data=json.dumps(payload).encode(), headers={'Content-Type': 'application/json'})
with urllib.request.urlopen(req) as resp:
    data = json.loads(resp.read())
    print('  Status: OK')
    print('  overall_score:', data['overall_score'])
    print('  ats_score:', data['ats_score'])
    print('  section_check:', data['section_check'])
    print('  ml_prediction:', data.get('ml_prediction'))

# Test 2: Multipart PDF upload
print()
print("=" * 50)
print("TEST 2: PDF File Upload Endpoint")
print("=" * 50)

pdf_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'test_resume.pdf')
with open(pdf_path, 'rb') as f:
    pdf_bytes = f.read()

boundary = 'TestBoundary123456789'
body_parts = []
body_parts.append(('--' + boundary).encode())
body_parts.append(b'Content-Disposition: form-data; name="resumes"; filename="test_resume.pdf"')
body_parts.append(b'Content-Type: application/pdf')
body_parts.append(b'')
body_parts.append(pdf_bytes)
body_parts.append(('--' + boundary).encode())
body_parts.append(b'Content-Disposition: form-data; name="target_role"')
body_parts.append(b'')
body_parts.append(b'Java Developer')
body_parts.append(('--' + boundary + '--').encode())

body = b'\r\n'.join(body_parts)

req2 = urllib.request.Request(
    url,
    data=body,
    headers={'Content-Type': 'multipart/form-data; boundary=' + boundary}
)
with urllib.request.urlopen(req2) as resp:
    data = json.loads(resp.read())
    print('  Status: OK')
    print('  candidate_name:', data.get('candidate_name'))
    print('  overall_score:', data.get('overall_score'))
    print('  ats_score:', data.get('ats_score'))
    print('  section_check:', data.get('section_check'))
    print('  ml_prediction:', data.get('ml_prediction'))
    print('  is_batch:', data.get('is_batch'))
    print('  total_candidates:', data.get('total_candidates'))

print()
print("ALL TESTS PASSED!")

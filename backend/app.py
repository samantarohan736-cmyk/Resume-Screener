import sqlite3
import re
import os
import io
import PyPDF2
from flask import Flask, request, jsonify
from flask_cors import CORS
from ml_model import predict_career, train_models
from database import DB_PATH

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Role metadata: required skills (out of 10) for radar charts, roadmaps, and target companies
ROLE_METADATA = {
    "Java Developer": {
        "required_skills": {
            "cgpa": 7.5, "java": 8.0, "python": 4.0, "web_dev": 5.0, "dsa": 8.0,
            "communication": 7.0, "leadership": 6.0, "projects": 3.0, "internships": 1.0, "certifications": 1.0
        },
        "learning_path": [
            "Advanced Java (Collections, Concurrency, Lambdas)",
            "Spring Boot Framework & Spring MVC",
            "Relational Databases & SQL (MySQL, PostgreSQL)",
            "RESTful API Development & Integration",
            "Microservices Architecture & Design Patterns",
            "Containerization with Docker",
            "Cloud Deployment Basics (AWS / Google Cloud)"
        ],
        "companies": ["TCS", "Infosys", "Accenture", "Zoho", "Amazon", "Wipro"]
    },
    "Full Stack Developer": {
        "required_skills": {
            "cgpa": 7.0, "java": 6.0, "python": 5.0, "web_dev": 9.0, "dsa": 7.0,
            "communication": 8.0, "leadership": 7.0, "projects": 3.0, "internships": 1.0, "certifications": 1.0
        },
        "learning_path": [
            "Modern HTML5, CSS3 & Responsive Design",
            "JavaScript (ES6+) and Document Object Model (DOM)",
            "React.js / Next.js Frontend Frameworks",
            "Node.js & Express.js Backend Development",
            "NoSQL & Relational Databases (MongoDB & MySQL)",
            "Git, GitHub & Collaborative Workflows",
            "Hosting and CI/CD (Vercel, Heroku, AWS)"
        ],
        "companies": ["Zoho", "Freshworks", "Paytm", "Cred", "Cognizant", "Swiggy"]
    },
    "Data Scientist": {
        "required_skills": {
            "cgpa": 8.0, "java": 4.0, "python": 9.0, "web_dev": 4.0, "dsa": 7.0,
            "communication": 8.0, "leadership": 7.0, "projects": 3.0, "internships": 1.0, "certifications": 2.0
        },
        "learning_path": [
            "Python Programming (Pandas, NumPy, Matplotlib)",
            "Applied Statistics & Probability Theory",
            "SQL & Relational Database Querying",
            "Supervised & Unsupervised Machine Learning Models",
            "Exploratory Data Analysis (EDA) & Feature Engineering",
            "Data Visualization Tools (Tableau, Power BI)",
            "Model Deployment (Flask, Streamlit)"
        ],
        "companies": ["Mu Sigma", "Fractal Analytics", "Tiger Analytics", "Google", "Microsoft", "Intel"]
    },
    "Machine Learning Engineer": {
        "required_skills": {
            "cgpa": 8.5, "java": 5.0, "python": 9.0, "web_dev": 4.0, "dsa": 8.0,
            "communication": 7.0, "leadership": 7.0, "projects": 4.0, "internships": 2.0, "certifications": 3.0
        },
        "learning_path": [
            "Advanced Python Programming",
            "Linear Algebra, Calculus & Optimization",
            "Scikit-Learn for Traditional ML Pipelines",
            "Deep Learning Frameworks (TensorFlow / PyTorch)",
            "Natural Language Processing (NLP) or Computer Vision",
            "MLOps (MLflow, Kubeflow, Model Tracking)",
            "GPU Computing & Scalable Cloud Deployments"
        ],
        "companies": ["NVIDIA", "Google", "Amazon", "Meta", "Microsoft", "Adobe"]
    },
    "Data Analyst": {
        "required_skills": {
            "cgpa": 7.2, "java": 3.0, "python": 8.0, "web_dev": 5.0, "dsa": 5.0,
            "communication": 9.0, "leadership": 7.0, "projects": 2.0, "internships": 1.0, "certifications": 2.0
        },
        "learning_path": [
            "Advanced MS Excel (Pivot Tables, VLOOKUP)",
            "SQL for Complex Queries and Joins",
            "Data Visualization with Power BI or Tableau",
            "Python Data Wrangling (Pandas, Numpy)",
            "Business Communication and Storytelling with Data",
            "A/B Testing & Statistical Inference"
        ],
        "companies": ["Deloitte", "EY", "KPMG", "PwC", "Capgemini", "Cognizant"]
    },
    "Cybersecurity Analyst": {
        "required_skills": {
            "cgpa": 7.5, "java": 5.0, "python": 6.0, "web_dev": 4.0, "dsa": 6.0,
            "communication": 7.0, "leadership": 7.0, "projects": 2.0, "internships": 1.0, "certifications": 2.0
        },
        "learning_path": [
            "Computer Networking Fundamentals (TCP/IP, DNS)",
            "Linux System Administration",
            "Security Fundamentals (Cryptography, IAM)",
            "Ethical Hacking & Vulnerability Assessment",
            "Security Information & Event Management (SIEM) Tools",
            "Incident Response and Threat Hunting",
            "Certifications Prep (CompTIA Security+, CEH)"
        ],
        "companies": ["Quick Heal", "FireEye", "Cisco", "IBM", "Palo Alto Networks", "CrowdStrike"]
    },
    "DevOps Engineer": {
        "required_skills": {
            "cgpa": 7.8, "java": 5.0, "python": 7.0, "web_dev": 5.0, "dsa": 7.0,
            "communication": 8.0, "leadership": 7.0, "projects": 3.0, "internships": 1.0, "certifications": 2.0
        },
        "learning_path": [
            "Linux Shell Scripting & Automation",
            "Git & Version Control Workflows",
            "Infrastructure as Code (IaC) with Terraform",
            "Containerization with Docker & Kubernetes",
            "CI/CD Pipelines (Jenkins, GitHub Actions)",
            "Configuration Management (Ansible)",
            "Cloud Infrastructure Management (AWS, Azure, GCP)"
        ],
        "companies": ["Red Hat", "Oracle", "VMware", "HCL", "Dell", "Capgemini"]
    },
    "Project Manager": {
        "required_skills": {
            "cgpa": 7.5, "java": 4.0, "python": 4.0, "web_dev": 5.0, "dsa": 5.0,
            "communication": 9.5, "leadership": 9.5, "projects": 3.0, "internships": 2.0, "certifications": 3.0
        },
        "learning_path": [
            "Software Development Life Cycle (SDLC) Models",
            "Agile & Scrum Framework Methodologies",
            "Project Management Software (Jira, Trello, MS Project)",
            "Effective Verbal & Written Communication",
            "Conflict Resolution & Team Leadership Dynamics",
            "Risk Management & Budget Estimation",
            "Certification Prep (CAPM, Certified ScrumMaster)"
        ],
        "companies": ["TCS", "Tech Mahindra", "Wipro", "Cognizant", "Microsoft", "Google"]
    }
}

# Mock Quiz Dataset
MOCK_QUIZZES = {
    "Java Developer": [
        {"id": 1, "question": "Which component is responsible for converting Java bytecode into machine code?", "options": ["JVM", "JDK", "JRE", "JIT Compiler"], "answer": 3},
        {"id": 2, "question": "What is the size of an int data type in Java?", "options": ["8 bits", "16 bits", "32 bits", "64 bits"], "answer": 2},
        {"id": 3, "question": "Which of these is NOT a member of the Java Collection framework?", "options": ["List", "Set", "Map", "Vector"], "answer": 2},
        {"id": 4, "question": "Which keyword is used to make a class inherit another class in Java?", "options": ["implements", "extends", "inherits", "super"], "answer": 1},
        {"id": 5, "question": "Which method in Java is executed first when running a class file?", "options": ["main()", "init()", "start()", "run()"], "answer": 0},
        {"id": 6, "question": "What is garbage collection in Java?", "options": ["Deleting unused files", "Reclaiming unused heap memory", "Cleaning compilation cache", "Deleting empty classes"], "answer": 1},
        {"id": 7, "question": "Which exception is thrown when an array is accessed with an invalid index?", "options": ["NullPointerException", "ArrayIndexOutOfBoundsException", "ArithmeticException", "IOException"], "answer": 1},
        {"id": 8, "question": "Which Spring Boot annotation is used to create a REST controller?", "options": ["@Controller", "@RestController", "@Service", "@Repository"], "answer": 1},
        {"id": 9, "question": "What is the time complexity of searching in a balanced Binary Search Tree?", "options": ["O(1)", "O(n)", "O(log n)", "O(n log n)"], "answer": 2},
        {"id": 10, "question": "What is the purpose of the 'finally' block in Java try-catch-finally?", "options": ["To catch exceptions", "To force exit the program", "To execute critical cleanups regardless of exception", "To log warnings"], "answer": 2}
    ],
    "Full Stack Developer": [
        {"id": 1, "question": "What does HTML stand for?", "options": ["Hyper Text Markup Language", "High Text Machine Language", "Hyper Tabular Multi Language", "None of the above"], "answer": 0},
        {"id": 2, "question": "Which HTML5 element is used to display graphics dynamically on a page?", "options": ["<svg>", "<canvas>", "<paint>", "<img>"], "answer": 1},
        {"id": 3, "question": "Which CSS property is used to change the background color of an element?", "options": ["color", "bg-color", "background-color", "element-bg"], "answer": 2},
        {"id": 4, "question": "In React, how do you pass data down to child components?", "options": ["State", "Props", "Context", "Redux"], "answer": 1},
        {"id": 5, "question": "Which React hook is used to perform side effects in functional components?", "options": ["useState", "useContext", "useEffect", "useMemo"], "answer": 2},
        {"id": 6, "question": "What is the purpose of Node.js?", "options": ["To compile CSS styles", "To run JavaScript on the server-side", "To database queries inside HTML", "To build responsive layout systems"], "answer": 1},
        {"id": 7, "question": "What does the 'npm' command do?", "options": ["Network Protocol Manager", "Node Package Manager", "Node Project Mapping", "None of the above"], "answer": 1},
        {"id": 8, "question": "Which Express.js method is used to bind middleware to your app?", "options": ["app.get()", "app.post()", "app.use()", "app.listen()"], "answer": 2},
        {"id": 9, "question": "Which of the following is a NoSQL document database?", "options": ["MySQL", "PostgreSQL", "MongoDB", "SQLite"], "answer": 2},
        {"id": 10, "question": "What does API stand for?", "options": ["Application Programming Interface", "Applicable Program Inspector", "Automated Project Integration", "Advanced Peripheral Interface"], "answer": 0}
    ],
    "Data Scientist": [
        {"id": 1, "question": "Which python library is primarily used for numerical computations?", "options": ["Pandas", "NumPy", "Scikit-Learn", "Matplotlib"], "answer": 1},
        {"id": 2, "question": "What is a DataFrame in Pandas?", "options": ["A 1D array of labels", "A 2D tabular data structure", "A database connector", "A statistical chart"], "answer": 1},
        {"id": 3, "question": "Which of these is a classification algorithm in machine learning?", "options": ["Linear Regression", "K-Means Clustering", "Logistic Regression", "Principal Component Analysis"], "answer": 2},
        {"id": 4, "question": "What is the main goal of unsupervised learning?", "options": ["Predicting labels", "Finding hidden patterns or groups in unlabeled data", "Minimizing prediction error", "Formatting tabular sheets"], "answer": 1},
        {"id": 5, "question": "What is the mean of the numbers: 2, 4, 4, 4, 5, 5, 7, 9?", "options": ["4", "5", "6", "4.5"], "answer": 1},
        {"id": 6, "question": "Which evaluation metric is best suited for an imbalanced classification dataset?", "options": ["Accuracy", "F1-Score / Precision-Recall AUC", "Mean Squared Error", "R-Squared"], "answer": 1},
        {"id": 7, "question": "What is the purpose of a confusion matrix?", "options": ["To combine multiple data sheets", "To visualize classification model performance", "To calculate matrix eigenvalues", "To handle database errors"], "answer": 1},
        {"id": 8, "question": "What does SQL stand for?", "options": ["Standard Query Language", "Structured Query Language", "Sequential Query Log", "Systemized Query Layout"], "answer": 1},
        {"id": 9, "question": "What is overfitting in machine learning?", "options": ["A model that performs poorly on both training and test data", "A model that performs exceptionally well on training data but poorly on unseen test data", "A model that takes too much memory to run", "A model with too few features"], "answer": 1},
        {"id": 10, "question": "What does a correlation coefficient of -0.9 indicate?", "options": ["Weak positive relation", "Strong positive relation", "Strong negative relation", "No relation"], "answer": 2}
    ]
}

# Fallback quiz for other roles
DEFAULT_QUIZ = [
    {"id": 1, "question": "What is the core purpose of Version Control Systems like Git?", "options": ["To compile code faster", "To host databases on cloud servers", "To track code changes and collaborate", "To generate automatic unit tests"], "answer": 2},
    {"id": 2, "question": "Which command is used to copy a Git repository locally?", "options": ["git push", "git clone", "git commit", "git copy"], "answer": 1},
    {"id": 3, "question": "What is Cloud Computing?", "options": ["Storing files on local hard drives", "Accessing computing services over the Internet on-demand", "Designing graphics in web applications", "None of the above"], "answer": 1},
    {"id": 4, "question": "What does CGPA stand for?", "options": ["Cumulative Grade Point Average", "Core Grade Point Assessment", "Calculated General Percent Average", "Curriculum Grade Point Association"], "answer": 0},
    {"id": 5, "question": "What is the primary role of a router in a network?", "options": ["To power computers", "To route packets between different networks", "To store static files", "To encrypt user databases"], "answer": 1},
    {"id": 6, "question": "Which of these is a soft skill?", "options": ["C++ Coding", "Database Schema Tuning", "Active Listening / Communication", "Shell Scripting"], "answer": 2},
    {"id": 7, "question": "What does the term 'Agile' mean in software management?", "options": ["An iterative approach to project delivery", "A coding style that is highly optimized", "A hosting platform", "A type of SQL database"], "answer": 0},
    {"id": 8, "question": "What is the main advantage of containerization (e.g. Docker)?", "options": ["It increases computer CPU speed", "It provides environment consistency across dev and prod", "It formats code indentation automatically", "It encrypts network cables"], "answer": 1},
    {"id": 9, "question": "What does 'LPA' stand for in job descriptions?", "options": ["License Per Application", "Lakhs Per Annum", "Layout Performance Assessment", "Lead Professional Analyst"], "answer": 1},
    {"id": 10, "question": "Which of the following is a relational database system?", "options": ["MongoDB", "Redis", "MySQL", "Cassandra"], "answer": 2}
]

# Interview Preparation Questions Q&A
INTERVIEW_QUESTIONS = {
    "Java Developer": [
        {"q": "What is the difference between HashMap and ConcurrentHashMap?", "a": "HashMap is not synchronized and thus not thread-safe. ConcurrentHashMap is thread-safe and divides the map into segments to allow concurrent read/write operations without locking the entire map, yielding much higher performance in multithreaded environments.", "tips": "Mention thread safety, synchronization, and bucket/segment lock mechanism.", "companies": ["Amazon", "TCS", "Oracle"]},
        {"q": "How does Spring Boot auto-configuration work?", "a": "Spring Boot scans dependencies on the classpath (e.g., spring-boot-starter-data-jpa) and uses @EnableAutoConfiguration to automatically configure classes and beans using conditional annotations like @ConditionalOnClass and @ConditionalOnMissingBean.", "tips": "Mention @SpringBootApplication and @Conditional annotations.", "companies": ["Accenture", "Zoho", "Cognizant"]},
        {"q": "What are the OOPs principles in Java and explain polymorphism?", "a": "The four main OOP principles are Inheritance, Encapsulation, Polymorphism, and Abstraction. Polymorphism allows objects of different types to be treated as objects of a common superclass. In Java, this is achieved via Method Overloading (compile-time) and Method Overriding (run-time).", "tips": "Use real-world examples (e.g., a Shape class with a draw() method).", "companies": ["Infosys", "Wipro", "LTI"]}
    ],
    "Full Stack Developer": [
        {"q": "What is the Virtual DOM in React and how does it optimize rendering?", "a": "The Virtual DOM is a lightweight copy of the real DOM. When state changes, React creates a new virtual tree, compares it with the previous one (diffing), and updates only the changed elements in the real DOM (reconciliation). This prevents expensive layout recalculations.", "tips": "Contrast Virtual DOM with Direct DOM manipulation.", "companies": ["Freshworks", "Zoho", "Cred"]},
        {"q": "Explain the difference between SQL and NoSQL databases.", "a": "SQL databases are relational, structured (schemas), use tables, and are vertically scalable (SQL Server, MySQL). NoSQL databases are non-relational, distributed, document/key-value based, and are horizontally scalable (MongoDB, Cassandra).", "tips": "Discuss ACID properties in SQL and flexibility in NoSQL.", "companies": ["Paytm", "Swiggy", "Cognizant"]},
        {"q": "What is CORS (Cross-Origin Resource Sharing) and how do you resolve it?", "a": "CORS is a browser security mechanism that restricts resources requested from another domain outside the domain from which the resource originated. It is resolved by setting appropriate Access-Control-Allow-Origin headers in the server backend.", "tips": "Explain preflight OPTIONS request and CORS backend middleware.", "companies": ["TCS", "Accenture", "Amazon"]}
    ],
    "Data Scientist": [
        {"q": "What is the difference between Supervised and Unsupervised Learning?", "a": "Supervised Learning uses labeled training data to predict outcomes (classification, regression). Unsupervised Learning finds hidden structures or relationships in unlabeled data (clustering, association).", "tips": "Give examples: Random Forest (supervised) vs K-Means (unsupervised).", "companies": ["Fractal Analytics", "Tiger Analytics", "Mu Sigma"]},
        {"q": "How do you handle missing or corrupted values in a dataset?", "a": "Missing data can be handled by deleting rows/columns (if minimal), imputing values (using Mean, Median, Mode, or K-NN imputation), or using models that tolerate missing values directly.", "tips": "Discuss data cleaning pipelines and the trade-offs of deletion vs imputation.", "companies": ["Intel", "Microsoft", "Google"]},
        {"q": "What is overfitting and how can you prevent it?", "a": "Overfitting occurs when a model learns the noise and details of the training set too well, leading to poor generalization. It is prevented using cross-validation, regularization (L1/L2), reducing feature count, or pruning decision trees.", "tips": "Explain the bias-variance trade-off.", "companies": ["Adobe", "Google", "Amazon"]}
    ]
}

DEFAULT_INTERVIEW_QUESTIONS = [
    {"q": "Tell me about a technical project you built.", "a": "Discuss the goal, stack used, your contribution, major technical challenges you overcame, and key results (e.g. speedups, user metrics). Use the STAR method: Situation, Task, Action, Result.", "tips": "Focus on problem-solving, architectural choices, and metrics.", "companies": ["All Companies"]},
    {"q": "What is the difference between Git merge and Git rebase?", "a": "Git merge incorporates changes from one branch into another, creating a new merge commit. Git rebase moves the base of your branch to a new starting point, rewriting history for a cleaner, linear commit timeline.", "tips": "Explain the history-preserving aspect of merge vs clean timeline of rebase.", "companies": ["Zoho", "Wipro", "TCS"]},
    {"q": "What are REST APIs and their main HTTP methods?", "a": "REST (Representational State Transfer) is an architectural style for network APIs. Key HTTP methods are: GET (retrieve data), POST (create data), PUT (replace data), PATCH (modify data), and DELETE (remove data).", "tips": "Mention status codes like 200 (OK), 201 (Created), 404 (Not Found), 500 (Server Error).", "companies": ["Accenture", "Cognizant", "Amazon"]}
]


# Simple Spelling Typos Dictionary for Resume Analyser
TYPOS = {
    r"\bexperiance\b": "experience",
    r"\bgoverment\b": "government",
    r"\bresponsibilties\b": "responsibilities",
    r"\bprograming\b": "programming",
    r"\bcertifcate\b": "certificate",
    r"\bcurriculam\b": "curriculum",
    r"\btecknology\b": "technology",
    r"\bdeveleper\b": "developer",
    r"\banalyzer\b": "analyser",
    r"\brecieve\b": "receive",
    r"\bseperate\b": "separate",
    r"\bachive\b": "achieve"
}

@app.route("/api/predict", methods=["POST"])
def predict():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Missing input data"}), 400
        
    try:
        # Extract features
        cgpa = float(data.get("cgpa", 0))
        java = int(data.get("java", 0))
        python = int(data.get("python", 0))
        web_dev = int(data.get("web_dev", 0))
        dsa = int(data.get("dsa", 0))
        communication = int(data.get("communication", 0))
        leadership = int(data.get("leadership", 0))
        projects = int(data.get("projects", 0))
        internships = int(data.get("internships", 0))
        certifications = int(data.get("certifications", 0))
        
        # Prepare list for model prediction
        student_features = {
            "cgpa": cgpa, "java": java, "python": python, "web_dev": web_dev, "dsa": dsa,
            "communication": communication, "leadership": leadership, "projects": projects,
            "internships": internships, "certifications": certifications
        }
        
        # Call prediction from ML model
        predictions = predict_career(student_features)
        recommended_role = predictions["recommended_role"]
        predicted_lpa = predictions["package_lpa"]
        
        # Adjust LPA based on Mock Test Score (if exists and was completed)
        mock_score = int(data.get("mock_score", -1))
        if mock_score >= 0:
            # Scale adjustment: up to +2.5 LPA for scoring 90%+, 0 for 50%, up to -1.0 LPA for scoring low
            test_factor = (mock_score - 50) / 20.0  # -2.5 to +2.5
            predicted_lpa = round(max(3.5, predicted_lpa + test_factor), 2)
            
        # Get metadata for role
        role_info = ROLE_METADATA.get(recommended_role, {
            "required_skills": {
                "cgpa": 7.0, "java": 5.0, "python": 5.0, "web_dev": 5.0, "dsa": 6.0,
                "communication": 7.0, "leadership": 6.0, "projects": 2.0, "internships": 1.0, "certifications": 1.0
            },
            "learning_path": [
                "Understand Core Programming Fundamentals",
                "Learn Version Control & Collaboration Tools (Git/GitHub)",
                "Build at least 2 hands-on projects in your target tech stack",
                "Master basic Data Structures & Algorithms",
                "Work on communication and presentation skills"
            ],
            "companies": ["TCS", "Infosys", "Wipro", "Cognizant"]
        })
        
        # Calculate skill gap (Required vs Student)
        skill_gap = []
        for skill, req_val in role_info["required_skills"].items():
            stud_val = student_features.get(skill, 0)
            gap = round(req_val - stud_val, 1)
            skill_gap.append({
                "skill": skill.upper().replace("_", " "),
                "required": req_val,
                "actual": stud_val,
                "gap": max(0.0, gap)
            })
            
        return jsonify({
            "recommended_role": recommended_role,
            "package_lpa": predicted_lpa,
            "learning_path": role_info["learning_path"],
            "companies": role_info["companies"],
            "skill_gap": skill_gap,
            "required_skills": role_info["required_skills"]
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def extract_text_from_pdf_file(pdf_file):
    """
    Robust multi-engine PDF text extraction pipeline:
    1. PyMuPDF (pymupdf) - handles vector/form/complex layers & text blocks
    2. pdfplumber - handles complex multi-column table layouts
    3. pypdf - handles standard stream objects
    4. pdfminer.six - high-level text stream parser
    5. EasyOCR - for scanned image-only PDF resumes
    """
    try:
        if hasattr(pdf_file, 'read'):
            pdf_bytes = pdf_file.read()
        elif isinstance(pdf_file, bytes):
            pdf_bytes = pdf_file
        else:
            return ""
    except Exception as e:
        print(f"Error reading file bytes: {e}")
        return ""

    if not pdf_bytes:
        return ""

    extracted_text = ""

    # Engine 1: PyMuPDF (pymupdf)
    try:
        import pymupdf
        doc = pymupdf.open(stream=pdf_bytes, filetype="pdf")
        pages_text = []
        for page in doc:
            t = page.get_text()
            if not t.strip():
                blocks = page.get_text("blocks")
                t = "\n".join([b[4] for b in blocks if len(b) >= 5 and b[4].strip()])
            if t.strip():
                pages_text.append(t.strip())
        extracted_text = "\n".join(pages_text).strip()
        if extracted_text:
            return extracted_text
    except Exception as e:
        print(f"pymupdf extraction note: {e}")

    # Engine 2: pdfplumber (best for compressed/encoded/layout PDFs)
    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            pages_text = []
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    pages_text.append(t)
            extracted_text = "\n".join(pages_text).strip()
            if extracted_text:
                return extracted_text
    except Exception as e:
        print(f"pdfplumber extraction note: {e}")

    # Engine 3: pypdf / PyPDF2
    try:
        import pypdf
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        pages_text = []
        for page in reader.pages:
            t = page.extract_text()
            if t:
                pages_text.append(t)
        extracted_text = "\n".join(pages_text).strip()
        if extracted_text:
            return extracted_text
    except Exception as e:
        print(f"pypdf extraction note: {e}")

    # Engine 4: pdfminer
    try:
        from pdfminer.high_level import extract_text as pdfminer_extract
        extracted_text = pdfminer_extract(io.BytesIO(pdf_bytes)).strip()
        if extracted_text:
            return extracted_text
    except Exception as e:
        print(f"pdfminer extraction note: {e}")

    # Engine 5: EasyOCR Fallback for image-only / scanned PDF resumes
    try:
        import pymupdf
        import PIL.Image
        import easyocr
        reader = easyocr.Reader(['en'], gpu=False)
        doc = pymupdf.open(stream=pdf_bytes, filetype="pdf")
        ocr_text_pages = []
        for page in doc:
            pix = page.get_pixmap(dpi=150)
            img = PIL.Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
            buf = io.BytesIO()
            img.save(buf, format="PNG")
            results = reader.readtext(buf.getvalue(), detail=0)
            if results:
                ocr_text_pages.append(" ".join(results))
        extracted_text = "\n".join(ocr_text_pages).strip()
        if extracted_text:
            return extracted_text
    except Exception as ocr_e:
        print(f"OCR fallback note: {ocr_e}")

    return extracted_text

def extract_candidate_name(text, filename=""):
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    if lines:
        first_line = lines[0]
        if len(first_line.split()) <= 4 and not re.search(r"resume|curriculum|cv|profile|summary|contact|education", first_line, re.IGNORECASE):
            return first_line
    if filename:
        name_part = os.path.splitext(filename)[0]
        name_part = re.sub(r"[_\-\.]", " ", name_part)
        name_part = re.sub(r"\b(resume|cv|pdf)\b", "", name_part, flags=re.IGNORECASE).strip()
        if name_part:
            return name_part.title()
    return "Candidate"

def parse_resume_features(text):
    text_lower = text.lower()
    
    # CGPA extraction
    cgpa_match = re.search(r"\b(?:cgpa|gpa|percentage|marks)[\s:]*([0-9]\.[0-9]{1,2}|10\.0|[0-9]{2}(?:\.[0-9]{1,2})?%?)", text_lower)
    cgpa = 7.5
    if cgpa_match:
        val_str = cgpa_match.group(1).replace("%", "")
        try:
            val = float(val_str)
            if val > 10.0:
                val = val / 10.0
            cgpa = min(10.0, max(4.0, val))
        except ValueError:
            pass
            
    def score_keywords(kw_list):
        matches = sum(1 for kw in kw_list if re.search(r"\b" + re.escape(kw) + r"\b", text_lower))
        return min(10, max(2, matches * 2 + 2)) if matches > 0 else 3
        
    java = score_keywords(["java", "spring", "spring boot", "hibernate", "maven", "jdk", "jvm", "j2ee"])
    python = score_keywords(["python", "pandas", "numpy", "django", "flask", "fastapi", "scikit-learn", "tensorflow", "pytorch", "jupyter"])
    web_dev = score_keywords(["html", "css", "javascript", "react", "node", "express", "angular", "vue", "tailwind", "bootstrap", "typescript"])
    dsa = score_keywords(["dsa", "data structures", "algorithms", "leetcode", "competitive programming", "tree", "graph", "sorting", "dynamic programming"])
    communication = score_keywords(["communication", "presentation", "verbal", "written", "fluent", "teamwork", "soft skills"])
    leadership = score_keywords(["leadership", "lead", "manager", "head", "captain", "president", "organized", "coordinator", "managed"])
    
    proj_matches = len(re.findall(r"\b(project|projects)\b", text_lower))
    projects = min(10, max(1, proj_matches))
    
    intern_matches = len(re.findall(r"\b(intern|internship|experience|work experience|employment)\b", text_lower))
    internships = min(5, max(0, intern_matches // 2))
    
    cert_matches = len(re.findall(r"\b(certified|certification|certifications|course|completed|certificate)\b", text_lower))
    certifications = min(5, max(0, cert_matches))

    return {
        "cgpa": cgpa,
        "java": java,
        "python": python,
        "web_dev": web_dev,
        "dsa": dsa,
        "communication": communication,
        "leadership": leadership,
        "projects": projects,
        "internships": internships,
        "certifications": certifications
    }

def process_single_resume_analysis(resume_text, role="Java Developer", candidate_name=None, filename=None):
    # 1. Spelling and Typos scanning
    mistakes = []
    corrected_text = resume_text
    
    for typo, correction in TYPOS.items():
        pattern = re.compile(typo, re.IGNORECASE)
        matches = list(pattern.finditer(corrected_text))
        if matches:
            for match in matches:
                word = match.group()
                mistakes.append({
                    "type": "Spelling / Typo",
                    "wrong": word,
                    "correct": correction,
                    "reason": f"Found spelling mistake: '{word}'. Recommend replacing with '{correction}'."
                })
            # Perform drop-in replacements
            corrected_text = pattern.sub(correction, corrected_text)
            
    # 2. Checklist of Sections (Check against both original & corrected text)
    sections = {
        "Contact Information": [r"contact", r"email", r"phone", r"address", r"github", r"linkedin", r"mobile", r"mail"],
        "Education": [r"education", r"degree", r"college", r"university", r"cgpa", r"btech", r"b\.tech", r"academic", r"qualification"],
        "Skills": [r"skills", r"technical skills", r"technologies", r"tools", r"languages", r"expertise", r"competencies"],
        "Projects": [r"projects", r"academic projects", r"key projects", r"personal projects", r"project"],
        "Experience": [r"experience", r"employment", r"internship", r"work experience", r"history", r"work", r"experiance"]
    }
    
    section_check = {}
    present_sections = 0
    search_corpus = resume_text + "\n" + corrected_text

    for section_name, keywords in sections.items():
        found = False
        for kw in keywords:
            if re.search(r"\b" + kw + r"\b", search_corpus, re.IGNORECASE):
                found = True
                break
        section_check[section_name] = found
        if found:
            present_sections += 1
            
    # 3. Contact details regex extraction
    has_email = bool(re.search(r"[\w\.-]+@[\w\.-]+\.\w+", resume_text))
    has_phone = bool(re.search(r"\b\d{10,12}\b|(?:\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b|\b\d{5}[\s.-]?\d{5}\b", resume_text))
    has_github = "github.com" in resume_text.lower() or "github:" in resume_text.lower() or "github" in resume_text.lower()
    has_linkedin = "linkedin.com" in resume_text.lower() or "linkedin:" in resume_text.lower() or "linkedin" in resume_text.lower()
    
    contact_suggestions = []
    if not has_email:
        contact_suggestions.append("Missing email address.")
    if not has_phone:
        contact_suggestions.append("Missing phone number.")
    if not has_github:
        contact_suggestions.append("No GitHub profile link found. Crucial for tech jobs.")
    if not has_linkedin:
        contact_suggestions.append("No LinkedIn profile link found. Crucial for professional networking.")
        
    # 4. ATS Keyword Match based on target role with Synonym Aliases
    ats_keywords = {
        "Java Developer": ["java", "spring boot", "sql", "dsa", "hibernate", "rest api", "maven", "mysql", "microservices", "git"],
        "Full Stack Developer": ["html", "css", "javascript", "react", "node.js", "express", "mongodb", "git", "rest api", "sql"],
        "Data Scientist": ["python", "machine learning", "pandas", "numpy", "statistics", "sql", "data analysis", "tableau", "power bi", "regression"],
        "Machine Learning Engineer": ["python", "tensorflow", "pytorch", "deep learning", "nlp", "scikit-learn", "mlops", "data science", "dsa", "aws"],
        "Data Analyst": ["python", "sql", "excel", "power bi", "tableau", "data analysis", "reporting", "dashboards", "statistics"],
        "Cybersecurity Analyst": ["networking", "security", "firewall", "cryptography", "wireshark", "siem", "ethical hacking", "linux", "penetration testing"],
        "DevOps Engineer": ["linux", "docker", "kubernetes", "aws", "terraform", "jenkins", "git", "bash", "ci/cd", "ansible"],
        "Project Manager": ["agile", "scrum", "jira", "project management", "sdlc", "leadership", "budgeting", "risk assessment", "planning", "communication"]
    }
    
    keywords = ats_keywords.get(role, ["git", "communication", "projects", "skills"])
    found_keywords = []
    text_lower = resume_text.lower()

    aliases = {
        "dsa": ["dsa", "data structures", "algorithms"],
        "rest api": ["rest api", "restful", "rest apis", "api"],
        "node.js": ["node.js", "nodejs", "node"],
        "react": ["react", "react.js", "reactjs"],
        "spring boot": ["spring boot", "spring"],
        "ci/cd": ["ci/cd", "ci-cd", "cicd"],
        "c++": ["c++", "cpp"],
        "power bi": ["power bi", "powerbi"],
        "express": ["express", "express.js", "expressjs"]
    }

    for kw in keywords:
        kw_lower = kw.lower()
        search_terms = aliases.get(kw_lower, [kw_lower])
        matched = False
        for term in search_terms:
            if re.search(r"[^a-zA-Z0-9_]", term):
                if term in text_lower:
                    matched = True
                    break
            else:
                if re.search(r"\b" + re.escape(term) + r"\b", text_lower):
                    matched = True
                    break
        if matched:
            found_keywords.append(kw)
            
    ats_score = int((len(found_keywords) / len(keywords)) * 100) if keywords else 0
    missing_keywords = [kw for kw in keywords if kw not in found_keywords]
    
    # 5. Calculate overall score
    # 30% from sections present, 30% from contacts complete, 40% from ATS keyword match
    section_score = (present_sections / len(sections)) * 100
    contact_count = sum([has_email, has_phone, has_github, has_linkedin])
    contact_score = (contact_count / 4) * 100
    
    overall_score = int((section_score * 0.3) + (contact_score * 0.3) + (ats_score * 0.4))
    
    # Generate Improvement bullet list
    improvements = []
    if section_score < 100:
        missing_secs = [k for k, v in section_check.items() if not v]
        improvements.append(f"Add missing sections to your resume: {', '.join(missing_secs)}.")
    if contact_score < 100:
        improvements.append(f"Complete your contact details: {', '.join(contact_suggestions)}")
    if ats_score < 70:
        improvements.append(f"Enhance matches for '{role}' by incorporating key missing skills: {', '.join(missing_keywords[:4])}.")
    if len(mistakes) > 0:
        improvements.append(f"Fix the {len(mistakes)} spelling / typographical errors identified in your text.")
        
    if not improvements:
        improvements.append("Your resume looks stellar! Ensure your project summaries clearly highlight quantitative impact (e.g., 'Optimized database queries, reducing loading speed by 20%').")

    # 6. ML Model Prediction
    extracted_features = parse_resume_features(resume_text)
    ml_prediction = None
    try:
        ml_prediction = predict_career(extracted_features)
    except Exception as e:
        print("ML model prediction error:", e)
        ml_prediction = {
            "recommended_role": role,
            "package_lpa": 6.5
        }

    if not candidate_name:
        candidate_name = extract_candidate_name(resume_text, filename or "")

    return {
        "candidate_name": candidate_name,
        "filename": filename or "Uploaded_Resume",
        "resume_text": resume_text,
        "overall_score": overall_score,
        "mistakes": mistakes,
        "section_check": section_check,
        "ats_score": ats_score,
        "missing_keywords": missing_keywords,
        "found_keywords": found_keywords,
        "improvements": improvements,
        "corrected_text": corrected_text,
        "ml_prediction": ml_prediction,
        "extracted_features": extracted_features
    }

@app.route("/api/analyze-resume", methods=["POST"])
def analyze_resume():
    # 1. Handle JSON Text Payload
    if request.is_json:
        data = request.get_json() or {}
        if "resume_text" not in data or not data["resume_text"].strip():
            return jsonify({"error": "No resume text provided"}), 400
            
        resume_text = data["resume_text"]
        role = data.get("target_role", "Java Developer")
        result = process_single_resume_analysis(resume_text, role=role)
        return jsonify(result)

    # 2. Handle File Uploads (Single or Multiple PDF files)
    files = request.files.getlist("resumes") or request.files.getlist("files") or request.files.getlist("file")
    if not files and "resume" in request.files:
        files = [request.files["resume"]]

    if not files:
        return jsonify({"error": "No resume file or text provided."}), 400

    target_role = request.form.get("target_role", "Java Developer")
    analyzed_candidates = []

    for f in files:
        if not f or not f.filename:
            continue

        filename = f.filename
        if filename.lower().endswith(".pdf"):
            raw_text = extract_text_from_pdf_file(f)
        else:
            try:
                raw_text = f.read().decode("utf-8", errors="ignore")
            except Exception:
                raw_text = ""

        if not raw_text.strip():
            analyzed_candidates.append({
                "candidate_name": extract_candidate_name("", filename),
                "filename": filename,
                "resume_text": "",
                "overall_score": 0,
                "mistakes": [],
                "section_check": {"Contact Information": False, "Education": False, "Skills": False, "Projects": False, "Experience": False},
                "ats_score": 0,
                "missing_keywords": [],
                "found_keywords": [],
                "improvements": ["Unable to extract text from PDF. Please make sure the PDF contains selectable text (not scanned images)."],
                "corrected_text": "",
                "ml_prediction": {"recommended_role": target_role, "package_lpa": 0.0},
                "extracted_features": {}
            })
            continue

        candidate_result = process_single_resume_analysis(
            raw_text,
            role=target_role,
            filename=filename
        )
        analyzed_candidates.append(candidate_result)

    if not analyzed_candidates:
        return jsonify({"error": "No valid PDF resume files found to analyze."}), 400

    total_candidates = len(analyzed_candidates)
    sorted_candidates = sorted(analyzed_candidates, key=lambda x: x["overall_score"], reverse=True)
    avg_score = round(sum(c["overall_score"] for c in sorted_candidates) / total_candidates, 1)

    return jsonify({
        "is_batch": total_candidates > 1,
        "total_candidates": total_candidates,
        "average_score": avg_score,
        "top_candidate": sorted_candidates[0]["candidate_name"],
        "candidates": sorted_candidates,
        # Preserve single object root structure for backward compatibility with 1 file
        **sorted_candidates[0]
    })

@app.route("/api/students", methods=["GET", "POST"])
def manage_students():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    if request.method == "GET":
        cursor.execute("SELECT * FROM students ORDER BY student_id DESC")
        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()
        students = [dict(zip(columns, row)) for row in rows]
        conn.close()
        return jsonify(students)
        
    elif request.method == "POST":
        data = request.get_json()
        if not data:
            return jsonify({"error": "Missing input data"}), 400
            
        try:
            # Auto generate student id
            cursor.execute("SELECT MAX(student_id) FROM students")
            max_id = cursor.fetchone()[0] or 100
            new_student_id = max_id + 1
            
            name = data.get("name", "New Student")
            branch = data.get("branch", "CSE")
            cgpa = float(data.get("cgpa", 0))
            java = int(data.get("java", 0))
            python = int(data.get("python", 0))
            web_dev = int(data.get("web_dev", 0))
            dsa = int(data.get("dsa", 0))
            communication = int(data.get("communication", 0))
            leadership = int(data.get("leadership", 0))
            projects = int(data.get("projects", 0))
            internships = int(data.get("internships", 0))
            certifications = int(data.get("certifications", 0))
            career_interest = data.get("career_interest", "Software Development")
            recommended_role = data.get("recommended_role", "Java Developer")
            package_lpa = float(data.get("package_lpa", 5.0))
            
            cursor.execute("""
                INSERT INTO students (
                    student_id, name, branch, cgpa, java, python, web_dev, dsa,
                    communication, leadership, projects, internships, certifications,
                    career_interest, recommended_role, package_lpa
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                new_student_id, name, branch, cgpa, java, python, web_dev, dsa,
                communication, leadership, projects, internships, certifications,
                career_interest, recommended_role, package_lpa
            ))
            conn.commit()
            
            # Retrain ML models dynamically on new entries!
            train_models()
            
            conn.close()
            return jsonify({"status": "success", "student_id": new_student_id})
        except Exception as e:
            conn.close()
            return jsonify({"error": str(e)}), 500

@app.route("/api/mock-test", methods=["GET"])
def get_mock_test():
    role = request.args.get("role", "Java Developer")
    questions = MOCK_QUIZZES.get(role, DEFAULT_QUIZ)
    return jsonify(questions)

@app.route("/api/interview-prep", methods=["GET"])
def get_interview_prep():
    role = request.args.get("role", "Java Developer")
    questions = INTERVIEW_QUESTIONS.get(role, DEFAULT_INTERVIEW_QUESTIONS)
    return jsonify(questions)

if __name__ == "__main__":
    # Ensure databases exist
    if not os.path.exists(DB_PATH):
        print("Database not found, initializing and seeding database...")
        from database import init_db
        init_db()
        
    # Retrain ML model once on startup
    print("Training ML Models...")
    try:
        train_models()
    except Exception as e:
        print(f"Error training models: {e}")
        
    app.run(port=5000, debug=True)

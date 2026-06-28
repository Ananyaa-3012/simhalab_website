"""Seed the database with dummy data for local development."""
import sys
import json
import shutil
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.database import engine, SessionLocal, Base
from app.models import *

LOREM_S = "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
LOREM_M = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
LOREM_L = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
LOREM_XL = LOREM_L + " Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis molestie dictum semper, metus arcu ullamcorper nibh, sit amet tempor eros felis id lorem. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas."

def p(text): return f"<p>{text}</p>"
def pp(t1, t2): return f"<p>{t1}</p><p>{t2}</p>"
def ppp(t1, t2, t3): return f"<p>{t1}</p><p>{t2}</p><p>{t3}</p>"
def jdumps(obj): return json.dumps(obj)

# Copy placeholder images to uploads
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)
for subdir in ["carousel", "people", "research", "projects", "news", "events", "gallery",
               "blog", "sponsors", "testimonials", "downloads"]:
    (uploads_dir / subdir).mkdir(exist_ok=True)

assets_dir = Path(__file__).parent.parent / "assets"
carousel_ph = assets_dir / "carousel_placeholder.png"
user_ph = assets_dir / "user_placeholder.png"

for subdir in ["carousel", "news", "events", "gallery", "blog", "research", "projects"]:
    dest = uploads_dir / subdir / "placeholder.png"
    if not dest.exists() and carousel_ph.exists():
        shutil.copy(carousel_ph, dest)

for subdir in ["people", "testimonials", "sponsors"]:
    dest = uploads_dir / subdir / "placeholder.png"
    if not dest.exists() and user_ph.exists():
        shutil.copy(user_ph, dest)

Base.metadata.create_all(bind=engine)
db = SessionLocal()

for table in reversed(Base.metadata.sorted_tables):
    db.execute(table.delete())
db.commit()

# --- Lab Head / About the Lab ---
lab_head = LabHeadMessage(
    name="Dr. Patanjali SLPSK",
    title="Assistant Professor, Dept. of Data Science and AI, WSAI, IIT Madras",
    photo_path="/uploads/people/placeholder.png",
    message_html=ppp(
        "SIMHA Lab (Secure Intelligent Models and Hardware Architecture) is a research group "
        "at the Wadhwani School of Data Science and AI, IIT Madras. We work at the intersection "
        "of machine learning, hardware design, and security — building systems that are efficient, "
        "robust, and trustworthy.",
        "Our current focus areas include AI for VLSI design automation, AI-assisted legal reasoning, "
        "adversarial machine learning for cybersecurity, and physics-informed neural networks. "
        "We collaborate closely with industry partners and other research groups at IIT Madras.",
        "We welcome students and researchers who are passionate about pushing the boundaries of "
        "AI and hardware security. If you are interested in joining or collaborating, please reach out.",
    ),
)
db.add(lab_head)

# --- People ---
people_data = [
    # Faculty
    Person(name="Dr. Patanjali SLPSK", photo_path="/uploads/people/placeholder.png",
           role="Lab Head", designation="Assistant Professor",
           department="Dept. of Data Science and AI, WSAI", category="faculty",
           bio_html=pp(LOREM_L, LOREM_M),
           research_interests='["AI 4 VLSI", "AI 4 Cybersecurity", "Hardware Security"]',
           email="patanjali@iitm.ac.in", github_url="https://github.com",
           google_scholar_url="https://scholar.google.com",
           personal_website_url="https://example.com", display_order=1),
    # Post Doctorate
    Person(name="John Doe", photo_path="/uploads/people/placeholder.png",
           role="Post-Doctoral Fellow", designation="Post-Doctoral Research Fellow",
           department="Dept. of Data Science and AI", category="postdoc",
           bio_html=pp(LOREM_M, LOREM_S),
           research_interests='["AI 4 Law", "Natural Language Processing"]',
           email="johndoe@iitm.ac.in", display_order=1),
    # PhD Scholars
    Person(name="Jane Doe", photo_path="/uploads/people/placeholder.png",
           role="PhD Scholar", designation="Research Scholar",
           department="Dept. of Data Science and AI", category="phd",
           bio_html=p(LOREM_M),
           research_interests='["AI 4 VLSI", "Deep Learning"]',
           email="janedoe@iitm.ac.in", display_order=1),
    Person(name="John Smith", photo_path="/uploads/people/placeholder.png",
           role="PhD Scholar", designation="Research Scholar",
           department="Dept. of Data Science and AI", category="phd",
           bio_html=p(LOREM_M),
           research_interests='["AI 4 Cybersecurity", "Adversarial ML"]',
           email="johnsmith@iitm.ac.in", display_order=2),
    # MS Students
    Person(name="S Shriprasad", photo_path="/uploads/people/placeholder.png",
           role="MS Scholar", designation="MS by Research",
           department="Dept. of Data Science and AI", category="ms",
           bio_html=p(LOREM_M), display_order=1),
    Person(name="B Shruthi", photo_path="/uploads/people/placeholder.png",
           role="MS Scholar", designation="MS by Research",
           department="Dept. of Data Science and AI", category="ms",
           bio_html=p(LOREM_M), display_order=2),
    # Post Baccalaureate
    Person(name="Krishna GD", photo_path="/uploads/people/placeholder.png",
           role="Post Baccalaureate Fellow", designation="Post Baccalaureate Research Fellow",
           department="Dept. of Data Science and AI", category="postbacc",
           bio_html=p(LOREM_M), display_order=1),
    # Project Associates
    Person(name="Ananyaa S", photo_path="/uploads/people/placeholder.png",
           role="Project Associate", designation="Project Associate",
           department="Dept. of Data Science and AI", category="project_associate",
           bio_html=p(LOREM_M), email="ananyaa@iitm.ac.in", display_order=1),
    # Interns
    Person(name="Tahiti Roy", photo_path="/uploads/people/placeholder.png",
           role="Research Intern", designation="Research Intern",
           department="Dept. of CSE", category="intern",
           bio_html=p(LOREM_S), display_order=1),
    Person(name="Samrudh", photo_path="/uploads/people/placeholder.png",
           role="Research Intern", designation="Research Intern",
           department="Dept. of DSAI", category="intern",
           bio_html=p(LOREM_S), display_order=2),
    Person(name="Kirtan", photo_path="/uploads/people/placeholder.png",
           role="Research Intern", designation="Research Intern",
           department="Dept. of EE", category="intern",
           bio_html=p(LOREM_S), display_order=3),
    Person(name="Harsh", photo_path="/uploads/people/placeholder.png",
           role="Research Intern", designation="Research Intern",
           department="Dept. of CSE", category="intern",
           bio_html=p(LOREM_S), display_order=4),
    Person(name="Prabrity", photo_path="/uploads/people/placeholder.png",
           role="Research Intern", designation="Research Intern",
           department="Dept. of DSAI", category="intern",
           bio_html=p(LOREM_S), display_order=5),
    # Alumni
    Person(name="Jane Smith", photo_path="/uploads/people/placeholder.png",
           role="Former MS Scholar", designation="Alumni",
           department="Dept. of DSAI", category="alumni",
           bio_html=p(LOREM_M), display_order=1),
    Person(name="Bob Doe", photo_path="/uploads/people/placeholder.png",
           role="Former PhD Scholar", designation="Alumni",
           department="Dept. of DSAI", category="alumni",
           bio_html=p(LOREM_M), display_order=2),
    Person(name="Alice Doe", photo_path="/uploads/people/placeholder.png",
           role="Former Project Associate", designation="Alumni",
           department="Dept. of DSAI", category="alumni",
           bio_html=p(LOREM_M), display_order=3),
]
db.add_all(people_data)
db.commit()

# Fetch IDs for FK references
dr_patanjali = db.query(Person).filter(Person.name == "Dr. Patanjali SLPSK").first()
john_doe_postdoc = db.query(Person).filter(Person.name == "John Doe").first()
jane_doe = db.query(Person).filter(Person.name == "Jane Doe").first()
john_smith = db.query(Person).filter(Person.name == "John Smith").first()

# --- Research Areas ---
research_areas = [
    ResearchArea(
        title="AI 4 VLSI",
        description_html=pp(
            "We explore how machine learning can accelerate and optimize the VLSI design flow — "
            "from logic synthesis and placement to timing closure and design-for-testability. "
            "Our work targets reducing turnaround time while improving PPA metrics.",
            "Key problems include graph neural networks for netlist representation, "
            "reinforcement learning for floorplanning, and generative models for cell layout."
        ),
        image_path="/uploads/research/placeholder.png",
        display_order=1,
        links_json=jdumps([
            {"title": "VLSI Design Automation Survey", "url": "https://example.com"},
            {"title": "EDA Tool Resources", "url": "https://example.com"},
        ]),
        media_json=jdumps([
            {"type": "news", "title": "SIMHA Lab presents at DAC 2025", "url": "https://example.com"},
        ]),
        contact_person_id=john_smith.id if john_smith else None,
    ),
    ResearchArea(
        title="AI 4 Law",
        description_html=pp(
            "We build AI systems to assist legal practitioners and researchers: "
            "statute retrieval, case law summarization, legal argument mining, and "
            "contract clause classification. Our models are grounded in Indian legal corpora.",
            "We work closely with law schools and legal-tech startups to develop systems "
            "that are interpretable, fair, and aligned with legal standards."
        ),
        image_path="/uploads/research/placeholder.png",
        display_order=2,
        links_json=jdumps([
            {"title": "Indian Legal NLP Corpus", "url": "https://example.com"},
            {"title": "Legal AI Workshop", "url": "https://example.com"},
        ]),
        media_json=jdumps([
            {"type": "news", "title": "AI 4 Law paper accepted at ACL 2025", "url": "https://example.com"},
        ]),
        contact_person_id=john_doe_postdoc.id if john_doe_postdoc else None,
    ),
    ResearchArea(
        title="AI 4 Cybersecurity",
        description_html=pp(
            "Our research targets both offensive and defensive AI in cybersecurity: "
            "adversarial attacks on deep learning models, robust training methods, "
            "malware detection, and network intrusion systems.",
            "We study how threat actors can misuse ML and develop countermeasures "
            "that are provably secure under formal threat models."
        ),
        image_path="/uploads/research/placeholder.png",
        display_order=3,
        links_json=jdumps([
            {"title": "Adversarial ML Reading List", "url": "https://example.com"},
            {"title": "Cybersecurity Dataset Repository", "url": "https://example.com"},
        ]),
        media_json=jdumps([
            {"type": "news", "title": "Best paper award at IEEE S&P 2025", "url": "https://example.com"},
        ]),
        contact_person_id=jane_doe.id if jane_doe else None,
    ),
    ResearchArea(
        title="AI 4 Physics",
        description_html=pp(
            "We develop physics-informed neural networks (PINNs) and scientific ML approaches "
            "to solve partial differential equations, model physical systems, and accelerate "
            "simulations in computational fluid dynamics and quantum mechanics.",
            "Our goal is to bridge the gap between data-driven learning and physics-based "
            "modelling, enabling accurate predictions with minimal labeled data."
        ),
        image_path="/uploads/research/placeholder.png",
        display_order=4,
        links_json=jdumps([
            {"title": "PINN Tutorial", "url": "https://example.com"},
            {"title": "Scientific ML Benchmark Suite", "url": "https://example.com"},
        ]),
        media_json=jdumps([
            {"type": "news", "title": "PINN paper at NeurIPS 2024", "url": "https://example.com"},
        ]),
        contact_person_id=dr_patanjali.id if dr_patanjali else None,
    ),
]
db.add_all(research_areas)
db.commit()

ra1, ra2, ra3, ra4 = [db.query(ResearchArea).filter(ResearchArea.title == t).first()
                      for t in ["AI 4 VLSI", "AI 4 Law", "AI 4 Cybersecurity", "AI 4 Physics"]]

# --- Publications (dummy titles, John Doe authors, example.com DOIs) ---
publications = [
    Publication(title="A Dummy Study on Lorem Ipsum Circuits Using Neural Networks",
                authors="John Doe, Jane Doe, Dr. Patanjali SLPSK",
                venue="Dummy Conference on VLSI 2025", year=2025, month=6,
                pub_type="conference", doi_url="https://example.com",
                research_area_id=ra1.id, is_featured=True),
    Publication(title="Why Lorem Ipsum Makes a Great Benchmark for AI 4 VLSI",
                authors="Jane Doe, John Smith",
                venue="Fake Symposium on EDA 2025", year=2025, month=3,
                pub_type="journal", doi_url="https://example.com",
                research_area_id=ra1.id),
    Publication(title="Lorem Ipsum Legal Clauses and Their Classification",
                authors="John Doe, Dr. Patanjali SLPSK",
                venue="Proceedings of Imaginary Legal NLP Workshop 2024", year=2024, month=10,
                pub_type="conference", doi_url="https://example.com",
                research_area_id=ra2.id, is_featured=True),
    Publication(title="Statute Retrieval Using Totally Made-Up Embeddings",
                authors="John Doe",
                venue="arXiv preprint, 2024", year=2024, month=7,
                pub_type="preprint", doi_url="https://example.com",
                research_area_id=ra2.id),
    Publication(title="Adversarial Attacks on Hypothetical Deep Learning Models",
                authors="John Smith, Jane Doe, Dr. Patanjali SLPSK",
                venue="Fake IEEE Workshop on Security 2025", year=2025, month=8,
                pub_type="conference", doi_url="https://example.com",
                research_area_id=ra3.id, is_featured=True),
    Publication(title="A Nonsensical Defense Against Imaginary Backdoor Attacks",
                authors="John Smith, John Doe",
                venue="Dummy Conference on Cybersecurity 2024", year=2024, month=12,
                pub_type="conference", doi_url="https://example.com",
                research_area_id=ra3.id),
    Publication(title="Physics-Informed Neural Networks for Solving Lorem Ipsum PDEs",
                authors="Dr. Patanjali SLPSK, John Doe",
                venue="Fictional NeurIPS Workshop 2024", year=2024, month=11,
                pub_type="conference", doi_url="https://example.com",
                research_area_id=ra4.id, is_featured=True),
    Publication(title="Totally Fabricated Results in Quantum ML Using Dummy Data",
                authors="John Doe, Jane Doe",
                venue="Imaginary ICLR 2025", year=2025, month=4,
                pub_type="conference", doi_url="https://example.com",
                research_area_id=ra4.id),
    Publication(title="Yet Another Dummy Paper About AI 4 VLSI Placement",
                authors="Jane Doe, John Smith, Dr. Patanjali SLPSK",
                venue="Bogus International Journal on EDA 2023", year=2023, month=9,
                pub_type="journal", doi_url="https://example.com",
                research_area_id=ra1.id),
    Publication(title="Complete Nonsense: Legal Document Summarization with LLMs",
                authors="John Doe, Dr. Patanjali SLPSK",
                venue="Made-Up ACL 2023", year=2023, month=6,
                pub_type="conference", doi_url="https://example.com",
                research_area_id=ra2.id),
]
db.add_all(publications)
db.commit()

# --- Tags ---
tags = [Tag(name=n, slug=n.lower()) for n in
        ["VLSI", "Law", "Cybersecurity", "Physics", "ML", "Security", "NLP", "AI"]]
db.add_all(tags)
db.commit()

# --- News ---
news_items = [
    News(title="Lorem ipsum dolor sit amet consectetur", summary=LOREM_M,
         content_html=p(LOREM_XL), image_path="/uploads/news/placeholder.png",
         source_name="Lorem Source", source_url="https://example.com",
         published_date="2025-09-15", is_featured=True),
    News(title="Ut enim ad minim veniam quis nostrud", summary=LOREM_M,
         content_html=p(LOREM_XL), image_path="/uploads/news/placeholder.png",
         source_name="Ipsum Journal", source_url="https://example.com",
         published_date="2025-08-20"),
    News(title="Duis aute irure dolor in reprehenderit", summary=LOREM_M,
         content_html=p(LOREM_XL), image_path="/uploads/news/placeholder.png",
         source_name="Dolor News", source_url="https://example.com",
         published_date="2025-08-10"),
    News(title="Excepteur sint occaecat cupidatat non proident", summary=LOREM_M,
         content_html=p(LOREM_XL), image_path="/uploads/news/placeholder.png",
         source_name="Amet Press", source_url="https://example.com",
         published_date="2025-07-01"),
    News(title="Nulla pariatur sed ut perspiciatis unde omnis", summary=LOREM_M,
         content_html=p(LOREM_XL), image_path="/uploads/news/placeholder.png",
         source_name="Consectetur Times", source_url="https://example.com",
         published_date="2025-06-15"),
    News(title="At vero eos et accusamus et iusto odio", summary=LOREM_M,
         content_html=p(LOREM_XL), image_path="/uploads/news/placeholder.png",
         source_name="Adipiscing Weekly", source_url="https://example.com",
         published_date="2025-05-20"),
]
db.add_all(news_items)

# --- Openings ---
openings = [
    Opening(position_title="PhD Position in AI 4 VLSI", position_type="phd",
            description_html=p(LOREM_XL),
            requirements_html=f"<ul><li>{LOREM_S}</li><li>{LOREM_S}</li><li>{LOREM_S}</li></ul>",
            deadline="2026-12-31", apply_url="https://research.iitm.ac.in", is_active=True),
    Opening(position_title="Post-Doctoral Fellow in AI 4 Law", position_type="postdoc",
            description_html=pp(LOREM_L, LOREM_M),
            requirements_html=f"<ul><li>{LOREM_S}</li><li>{LOREM_S}</li><li>{LOREM_S}</li></ul>",
            deadline="2026-09-30", apply_url="https://research.iitm.ac.in", is_active=True),
    Opening(position_title="Post-Baccalaureate Fellowship", position_type="postbacc",
            description_html=pp(LOREM_L, LOREM_M),
            requirements_html=f"<ul><li>{LOREM_S}</li><li>{LOREM_S}</li></ul>",
            apply_url="https://research.iitm.ac.in", is_active=True),
    Opening(position_title="Summer Internship 2026", position_type="internship",
            description_html=p(LOREM_L),
            requirements_html=f"<ul><li>{LOREM_S}</li><li>{LOREM_S}</li></ul>",
            deadline="2026-03-15", apply_url="https://research.iitm.ac.in", is_active=True),
]
db.add_all(openings)

# --- Gallery ---
cat_events = GalleryCategory(name="Events", slug="events", display_order=1)
cat_lab = GalleryCategory(name="Lab", slug="lab", display_order=2)
cat_team = GalleryCategory(name="Team", slug="team", display_order=3)
cat_conferences = GalleryCategory(name="Conferences", slug="conferences", display_order=4)
db.add_all([cat_events, cat_lab, cat_team, cat_conferences])
db.commit()

gallery_images = [
    GalleryImage(image_path="/uploads/gallery/placeholder.png", caption="Lorem Ipsum Workshop 2025",
                 alt_text="Lorem ipsum dolor sit amet", event_name="Lorem Workshop",
                 date_taken="2025-07-15", category_id=1, display_order=1),
    GalleryImage(image_path="/uploads/gallery/placeholder.png", caption="Lab Setup",
                 alt_text="Dolor sit amet consectetur", event_name="Lab Inauguration",
                 date_taken="2024-01-15", category_id=2, display_order=1),
    GalleryImage(image_path="/uploads/gallery/placeholder.png", caption="Team Photo 2025",
                 alt_text="Adipiscing elit sed do eiusmod", event_name="Annual Review 2025",
                 date_taken="2025-03-10", category_id=3, display_order=1),
    GalleryImage(image_path="/uploads/gallery/placeholder.png", caption="Conference Presentation",
                 alt_text="Ut enim ad minim veniam", event_name="Lorem Conference 2024",
                 date_taken="2024-12-10", category_id=4, display_order=1),
    GalleryImage(image_path="/uploads/gallery/placeholder.png", caption="Guest Lecture",
                 alt_text="Quis nostrud exercitation ullamco", event_name="Guest Lecture Series",
                 date_taken="2025-04-22", category_id=1, display_order=2),
    GalleryImage(image_path="/uploads/gallery/placeholder.png", caption="Lab Equipment",
                 alt_text="Laboris nisi ut aliquip commodo", event_name="Lab Equipment",
                 date_taken="2024-06-01", category_id=2, display_order=2),
    GalleryImage(image_path="/uploads/gallery/placeholder.png", caption="Farewell Celebration",
                 alt_text="Duis aute irure dolor reprehenderit", event_name="Farewell Celebration",
                 date_taken="2023-12-20", category_id=3, display_order=2),
    GalleryImage(image_path="/uploads/gallery/placeholder.png", caption="Dolor Conference 2025",
                 alt_text="Voluptate velit esse cillum dolore", event_name="Dolor Conference 2025",
                 date_taken="2025-08-10", category_id=4, display_order=2),
]
db.add_all(gallery_images)

# --- Links (for Resources page) ---
links_data = [
    Link(title="SIMHA Lab GitHub", url="https://github.com", description=LOREM_S,
         icon="github", category="github", display_order=1),
    Link(title="Research Portal IITM", url="https://research.iitm.ac.in", description=LOREM_S,
         icon="globe", category="resource", display_order=2),
    Link(title="WSAI Newsletter", url="https://example.com", description=LOREM_S,
         icon="mail", category="newsletter", display_order=3),
    Link(title="Lab Blog", url="https://example.com", description=LOREM_S,
         icon="book", category="blog", display_order=4),
]
db.add_all(links_data)

# --- Flowcharts ---
fc1 = Flowchart(title="BTech to PhD Pathway", description=LOREM_S, display_order=1)
fc2 = Flowchart(title="MS / Direct PhD Pathway", description=LOREM_S, display_order=2)
fc3 = Flowchart(title="Post-Doc & Post-Bacc Pathway", description=LOREM_S, display_order=3)
db.add_all([fc1, fc2, fc3])
db.commit()

fc1_nodes = [
    FlowchartNode(flowchart_id=fc1.id, node_id="1", label="BTech/BE Graduate", position_x=250, position_y=0, node_type="input"),
    FlowchartNode(flowchart_id=fc1.id, node_id="2", label="GATE Qualification", position_x=100, position_y=100),
    FlowchartNode(flowchart_id=fc1.id, node_id="3", label="MS by Research at IITM", position_x=100, position_y=200),
    FlowchartNode(flowchart_id=fc1.id, node_id="4", label="Convert MS to PhD", position_x=100, position_y=300),
    FlowchartNode(flowchart_id=fc1.id, node_id="5", label="Direct PhD (Exceptional)", position_x=400, position_y=100),
    FlowchartNode(flowchart_id=fc1.id, node_id="6", label="PhD at SIMHA Lab", position_x=250, position_y=400, node_type="output"),
]
db.add_all(fc1_nodes)
fc1_edges = [
    FlowchartEdge(flowchart_id=fc1.id, edge_id="e1-2", source_node_id="1", target_node_id="2", label="Via GATE"),
    FlowchartEdge(flowchart_id=fc1.id, edge_id="e1-5", source_node_id="1", target_node_id="5", label="Exceptional record"),
    FlowchartEdge(flowchart_id=fc1.id, edge_id="e2-3", source_node_id="2", target_node_id="3"),
    FlowchartEdge(flowchart_id=fc1.id, edge_id="e3-4", source_node_id="3", target_node_id="4", label="After coursework"),
    FlowchartEdge(flowchart_id=fc1.id, edge_id="e4-6", source_node_id="4", target_node_id="6"),
    FlowchartEdge(flowchart_id=fc1.id, edge_id="e5-6", source_node_id="5", target_node_id="6"),
]
db.add_all(fc1_edges)

fc2_nodes = [
    FlowchartNode(flowchart_id=fc2.id, node_id="1", label="M.Tech / MS Graduate", position_x=250, position_y=0, node_type="input"),
    FlowchartNode(flowchart_id=fc2.id, node_id="2", label="GATE Score / Interview", position_x=250, position_y=100),
    FlowchartNode(flowchart_id=fc2.id, node_id="3", label="Apply on research.iitm.ac.in", position_x=250, position_y=200),
    FlowchartNode(flowchart_id=fc2.id, node_id="4", label="Faculty Interview", position_x=250, position_y=300),
    FlowchartNode(flowchart_id=fc2.id, node_id="5", label="PhD at SIMHA Lab", position_x=250, position_y=400, node_type="output"),
]
db.add_all(fc2_nodes)
fc2_edges = [
    FlowchartEdge(flowchart_id=fc2.id, edge_id="e1-2", source_node_id="1", target_node_id="2"),
    FlowchartEdge(flowchart_id=fc2.id, edge_id="e2-3", source_node_id="2", target_node_id="3"),
    FlowchartEdge(flowchart_id=fc2.id, edge_id="e3-4", source_node_id="3", target_node_id="4", label="Shortlisted"),
    FlowchartEdge(flowchart_id=fc2.id, edge_id="e4-5", source_node_id="4", target_node_id="5", label="Selected"),
]
db.add_all(fc2_edges)

fc3_nodes = [
    FlowchartNode(flowchart_id=fc3.id, node_id="1", label="PhD Graduate", position_x=150, position_y=0, node_type="input"),
    FlowchartNode(flowchart_id=fc3.id, node_id="2", label="BTech/BE Graduate", position_x=400, position_y=0, node_type="input"),
    FlowchartNode(flowchart_id=fc3.id, node_id="3", label="Post-Doc Application", position_x=150, position_y=120),
    FlowchartNode(flowchart_id=fc3.id, node_id="4", label="Post-Bacc Application", position_x=400, position_y=120),
    FlowchartNode(flowchart_id=fc3.id, node_id="5", label="Interview + Proposal", position_x=150, position_y=240),
    FlowchartNode(flowchart_id=fc3.id, node_id="6", label="Interview + SOP", position_x=400, position_y=240),
    FlowchartNode(flowchart_id=fc3.id, node_id="7", label="Post-Doctoral Fellow", position_x=150, position_y=360, node_type="output"),
    FlowchartNode(flowchart_id=fc3.id, node_id="8", label="Post-Bacc Fellow", position_x=400, position_y=360, node_type="output"),
]
db.add_all(fc3_nodes)
fc3_edges = [
    FlowchartEdge(flowchart_id=fc3.id, edge_id="e1-3", source_node_id="1", target_node_id="3"),
    FlowchartEdge(flowchart_id=fc3.id, edge_id="e2-4", source_node_id="2", target_node_id="4"),
    FlowchartEdge(flowchart_id=fc3.id, edge_id="e3-5", source_node_id="3", target_node_id="5"),
    FlowchartEdge(flowchart_id=fc3.id, edge_id="e4-6", source_node_id="4", target_node_id="6"),
    FlowchartEdge(flowchart_id=fc3.id, edge_id="e5-7", source_node_id="5", target_node_id="7", label="Selected"),
    FlowchartEdge(flowchart_id=fc3.id, edge_id="e6-8", source_node_id="6", target_node_id="8", label="Selected"),
]
db.add_all(fc3_edges)

# --- Blog Posts ---
blog_posts = [
    BlogPost(
        title="Lorem ipsum dolor sit amet consectetur adipiscing elit",
        slug="lorem-ipsum-dolor-sit-amet",
        content_html=f"<h2>Lorem Ipsum</h2>{p(LOREM_XL)}<h2>Dolor Sit Amet</h2>{p(LOREM_XL)}",
        excerpt=LOREM_M,
        cover_image_path="/uploads/blog/placeholder.png",
        author_id=1, is_published=True, published_date="2025-06-15"
    ),
    BlogPost(
        title="Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
        slug="sed-do-eiusmod-tempor-incididunt",
        content_html=f"<h2>Sed Do Eiusmod</h2>{p(LOREM_XL)}<h2>Tempor Incididunt</h2>{p(LOREM_XL)}",
        excerpt=LOREM_M,
        cover_image_path="/uploads/blog/placeholder.png",
        author_id=2, is_published=True, published_date="2025-05-01"
    ),
    BlogPost(
        title="Ut enim ad minim veniam quis nostrud exercitation ullamco",
        slug="ut-enim-ad-minim-veniam",
        content_html=f"<h2>Ut Enim</h2>{p(LOREM_XL)}<h2>Ad Minim Veniam</h2>{p(LOREM_XL)}",
        excerpt=LOREM_M,
        cover_image_path="/uploads/blog/placeholder.png",
        author_id=3, is_published=True, published_date="2025-03-20"
    ),
]
db.add_all(blog_posts)

# --- Downloads ---
downloads = [
    Download(title="AI 4 VLSI Dataset (Dummy)", description=LOREM_M,
             file_url="https://example.com/download/vlsi-dataset.zip",
             category="dataset", display_order=1, is_active=True),
    Download(title="SIMHA Lab Codebase (Dummy)", description=LOREM_M,
             file_url="https://github.com",
             category="code", display_order=2, is_active=True),
]
db.add_all(downloads)

# --- Contact Info ---
contact = ContactInfo(
    phone="+91-44-2257-XXXX",
    email="simha@iitm.ac.in",
    address_html="<p>SIMHA Lab<br>Wadhwani School of Data Science and AI<br>IIT Madras<br>Chennai - 600036<br>Tamil Nadu, India</p>",
    google_maps_embed_url="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d242.9811914274577!2d80.22704154253009!3d12.991089793043027!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a52673043960081%3A0xd18bd9bbda35314e!2sNew%20Acadamic%20Complex%202%20-%20NAC2%20block!5e0!3m2!1sen!2sin!4v1779790991061!5m2!1sen!2sin",
    google_maps_link="https://maps.app.goo.gl/NocLqkPLYRxjKNq76",
    office_hours="Monday - Friday: 9:00 AM - 5:30 PM IST",
)
db.add(contact)

# --- Site Settings ---
site_settings = [
    SiteSetting(key="github_url", value="https://github.com/simha-iitm", value_type="url"),
    SiteSetting(key="linkedin_url", value="https://linkedin.com/company/simha-iitm", value_type="url"),
    SiteSetting(key="twitter_url", value="https://twitter.com/simha_iitm", value_type="url"),
    SiteSetting(key="youtube_url", value="https://youtube.com/@simha-iitm", value_type="url"),
    SiteSetting(key="footer_text",
                value="SIMHA Lab — Secure Intelligent Models and Hardware Architecture | Wadhwani School of Data Science and AI | IIT Madras",
                value_type="text"),
    SiteSetting(key="group_photo_path", value="/uploads/carousel/placeholder.png", value_type="url"),
    SiteSetting(key="show_about", value="1", value_type="text"),
    SiteSetting(key="show_news", value="1", value_type="text"),
    SiteSetting(key="show_openings", value="1", value_type="text"),
]
db.add_all(site_settings)

db.commit()
db.close()

print("Database seeded successfully!")

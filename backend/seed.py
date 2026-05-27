"""Seed the database with dummy data for local development."""
import sys
import shutil
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.database import engine, SessionLocal, Base
from app.models import *

LOREM_S = "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
LOREM_M = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
LOREM_L = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
LOREM_XL = LOREM_L + " Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis molestie dictum semper, metus arcu ullamcorper nibh, sit amet tempor eros felis id lorem. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas."

def p(text):
    return f"<p>{text}</p>"

def pp(t1, t2):
    return f"<p>{t1}</p><p>{t2}</p>"

def ppp(t1, t2, t3):
    return f"<p>{t1}</p><p>{t2}</p><p>{t3}</p>"

# Copy placeholder images to uploads
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)
for subdir in ["carousel", "people", "research", "projects", "news", "events", "gallery", "blog", "sponsors", "testimonials"]:
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

# --- Carousel Slides ---
slides = [
    CarouselSlide(title="Welcome to SIMHA", subtitle=LOREM_M, image_path="/uploads/carousel/placeholder.png", cta_text="Learn More", cta_link="/research", display_order=1, is_active=True),
    CarouselSlide(title="Positions Open", subtitle=LOREM_M, image_path="/uploads/carousel/placeholder.png", cta_text="Apply Now", cta_link="/join-us", display_order=2, is_active=True),
    CarouselSlide(title="Lorem Ipsum 2025", subtitle=LOREM_M, image_path="/uploads/carousel/placeholder.png", cta_text="Read More", cta_link="/publications", display_order=3, is_active=True),
]
db.add_all(slides)

# --- Lab Head Message ---
lab_head = LabHeadMessage(
    name="Dr. Patanjali SLPSK",
    title="Assistant Professor, Dept. of Data Science and AI, WSAI, IIT Madras",
    photo_path="/uploads/people/placeholder.png",
    message_html=ppp(LOREM_L, LOREM_M, LOREM_M),
)
db.add(lab_head)

# --- Announcements ---
announcements = [
    Announcement(title="Positions Open for Jan 2027", description=LOREM_S, link_url="https://research.iitm.ac.in", link_text="Apply on research.iitm.ac.in", announcement_type="recruitment", is_active=True, display_order=1),
    Announcement(title="Fellowship Available", description=LOREM_S, link_url="https://research.iitm.ac.in", link_text="More Details", announcement_type="recruitment", is_active=True, display_order=2),
]
db.add_all(announcements)

# --- People ---
people_data = [
    Person(name="Dr. Patanjali SLPSK", photo_path="/uploads/people/placeholder.png", role="Lab Head", designation="Assistant Professor", department="Dept. of Data Science and AI, WSAI", category="faculty", bio_html=pp(LOREM_L, LOREM_M), research_interests='["Lorem Ipsum", "Dolor Sit", "Amet Consectetur", "Adipiscing Elit"]', email="patanjali@iitm.ac.in", github_url="https://github.com", google_scholar_url="https://scholar.google.com", personal_website_url="https://example.com", display_order=1),
    Person(name="Ananyaa S", photo_path="/uploads/people/placeholder.png", role="Project Associate", designation="Project Associate", department="Dept. of Data Science and AI", category="project_associate", bio_html=p(LOREM_M), email="ananyaa@iitm.ac.in", display_order=1),
    Person(name="Dr. Vikram Patel", photo_path="/uploads/people/placeholder.png", role="Post-Doctoral Fellow", designation="Post-Doctoral Research Fellow", department="Dept. of Data Science and AI", category="postdoc", bio_html=pp(LOREM_M, LOREM_S), research_interests='["Lorem Ipsum", "Dolor Sit", "Amet Consectetur"]', display_order=1),
    Person(name="Arjun Mehta", photo_path="/uploads/people/placeholder.png", role="PhD Scholar", designation="Research Scholar", department="Dept. of Data Science and AI", category="phd", bio_html=pp(LOREM_M, LOREM_S), research_interests='["Lorem Ipsum", "Dolor Sit", "Amet Consectetur"]', github_url="https://github.com", google_scholar_url="https://scholar.google.com", display_order=1),
    Person(name="Kavitha Rajan", photo_path="/uploads/people/placeholder.png", role="PhD Scholar", designation="Research Scholar", department="Dept. of Data Science and AI", category="phd", bio_html=p(LOREM_M), research_interests='["Lorem Ipsum", "Dolor Sit"]', github_url="https://github.com", display_order=2),
    Person(name="Shriprasad S", photo_path="/uploads/people/placeholder.png", role="MS Scholar", designation="MS by Research", department="Dept. of Data Science and AI", category="pg", bio_html=p(LOREM_M), research_interests='["Lorem Ipsum", "Dolor Sit"]', display_order=1),
    Person(name="Shruthi B", photo_path="/uploads/people/placeholder.png", role="MS Scholar", designation="MS by Research", department="Dept. of Data Science and AI", category="pg", bio_html=p(LOREM_M), research_interests='["Lorem Ipsum", "Amet Consectetur"]', display_order=2),
    Person(name="Krishna GD", photo_path="/uploads/people/placeholder.png", role="Post Baccalaureate", designation="Post Baccalaureate Research Fellow", department="Dept. of Data Science and AI", category="pg", bio_html=p(LOREM_M), research_interests='["Lorem Ipsum", "Dolor Sit"]', display_order=3),
    Person(name="Rohan Gupta", photo_path="/uploads/people/placeholder.png", role="Research Intern", designation="B.Tech CSE, 4th Year", department="Dept. of CSE", category="ug", bio_html=p(LOREM_S), display_order=1),
    Person(name="Meera Krishnan", photo_path="/uploads/people/placeholder.png", role="Research Intern", designation="B.Tech DSAI, 3rd Year", department="Dept. of DSAI", category="ug", bio_html=p(LOREM_S), display_order=2),
    Person(name="Aditya Raghavan", photo_path="/uploads/people/placeholder.png", role="Former MS Scholar", designation="Alumni", department="Dept. of DSAI", category="alumni", bio_html=p(LOREM_M), display_order=1),
    Person(name="Nisha Iyer", photo_path="/uploads/people/placeholder.png", role="Former PhD Scholar", designation="Alumni", department="Dept. of DSAI", category="alumni", bio_html=p(LOREM_M), display_order=2),
]
db.add_all(people_data)
db.commit()

# --- Research Areas ---
research_areas = [
    ResearchArea(title="Lorem Ipsum Research", description_html=pp(LOREM_L, LOREM_M), image_path="/uploads/research/placeholder.png", display_order=1),
    ResearchArea(title="Dolor Sit Amet", description_html=pp(LOREM_L, LOREM_M), image_path="/uploads/research/placeholder.png", display_order=2),
    ResearchArea(title="Consectetur Adipiscing", description_html=pp(LOREM_L, LOREM_M), image_path="/uploads/research/placeholder.png", display_order=3),
    ResearchArea(title="Sed Do Eiusmod", description_html=pp(LOREM_L, LOREM_M), image_path="/uploads/research/placeholder.png", display_order=4),
]
db.add_all(research_areas)
db.commit()

# --- Publications ---
publications = [
    Publication(title="Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod", authors="Arjun Mehta, Dr. Patanjali SLPSK", venue="Lorem Ipsum Journal", year=2025, month=6, pub_type="journal", doi_url="https://doi.org/10.1000/example1", research_area_id=1, is_featured=True),
    Publication(title="Ut enim ad minim veniam quis nostrud exercitation ullamco laboris", authors="Kavitha Rajan, Dr. Patanjali SLPSK", venue="Dolor Sit Conference", year=2025, month=8, pub_type="conference", doi_url="https://doi.org/10.1000/example2", research_area_id=2),
    Publication(title="Duis aute irure dolor in reprehenderit in voluptate velit esse cillum", authors="Arjun Mehta, Shriprasad S, Dr. Patanjali SLPSK", venue="Amet Consectetur Workshop", year=2024, month=12, pub_type="conference", doi_url="https://doi.org/10.1000/example3", research_area_id=1),
    Publication(title="Excepteur sint occaecat cupidatat non proident sunt in culpa", authors="Dr. Vikram Patel, Shruthi B", venue="Adipiscing Elit Symposium", year=2024, month=7, pub_type="conference", research_area_id=3),
    Publication(title="Nulla pariatur sed ut perspiciatis unde omnis iste natus error sit", authors="Kavitha Rajan, Dr. Patanjali SLPSK", venue="Lorem Ipsum Conference", year=2024, month=11, pub_type="conference", research_area_id=2, is_featured=True),
    Publication(title="At vero eos et accusamus et iusto odio dignissimos ducimus blanditiis", authors="Shriprasad S, Dr. Vikram Patel", venue="arXiv preprint", year=2025, month=3, pub_type="preprint", research_area_id=4),
    Publication(title="Nam libero tempore cum soluta nobis eligendi optio cumque nihil impedit", authors="Dr. Patanjali SLPSK, Arjun Mehta", venue="Dolor Sit Conference", year=2023, month=7, pub_type="conference", research_area_id=3),
    Publication(title="Temporibus autem quibusdam et aut officiis debitis rerum necessitatibus", authors="Shruthi B, Arjun Mehta, Dr. Patanjali SLPSK", venue="Lorem Amet Conference", year=2025, month=2, pub_type="conference", research_area_id=4),
    Publication(title="Itaque earum rerum hic tenetur a sapiente delectus ut aut reiciendis", authors="Aditya Raghavan, Dr. Patanjali SLPSK", venue="Consectetur Conference", year=2024, month=5, pub_type="conference", research_area_id=1),
    Publication(title="Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse", authors="Dr. Vikram Patel, Shriprasad S, Dr. Patanjali SLPSK", venue="Ipsum Dolor Symposium", year=2025, month=5, pub_type="conference", research_area_id=3, is_featured=True),
]
db.add_all(publications)
db.commit()

pub_links = [
    PublicationAuthor(publication_id=1, person_id=4, author_order=0),
    PublicationAuthor(publication_id=1, person_id=1, author_order=1),
    PublicationAuthor(publication_id=2, person_id=5, author_order=0),
    PublicationAuthor(publication_id=2, person_id=1, author_order=1),
    PublicationAuthor(publication_id=3, person_id=4, author_order=0),
    PublicationAuthor(publication_id=3, person_id=6, author_order=1),
    PublicationAuthor(publication_id=4, person_id=3, author_order=0),
    PublicationAuthor(publication_id=4, person_id=7, author_order=1),
    PublicationAuthor(publication_id=5, person_id=5, author_order=0),
    PublicationAuthor(publication_id=5, person_id=1, author_order=1),
]
db.add_all(pub_links)

# --- Tags ---
tags = [
    Tag(name="Lorem", slug="lorem"),
    Tag(name="Ipsum", slug="ipsum"),
    Tag(name="Dolor", slug="dolor"),
    Tag(name="Sit", slug="sit"),
    Tag(name="Amet", slug="amet"),
    Tag(name="Consectetur", slug="consectetur"),
    Tag(name="Adipiscing", slug="adipiscing"),
    Tag(name="Elit", slug="elit"),
]
db.add_all(tags)
db.commit()

# --- Projects ---
projects = [
    Project(title="Lorem Ipsum Project Alpha", description_html=pp(LOREM_L, LOREM_M), image_path="/uploads/projects/placeholder.png", status="ongoing", start_date="2024-01-01", research_area_id=1),
    Project(title="Dolor Sit Amet Project", description_html=pp(LOREM_L, LOREM_M), image_path="/uploads/projects/placeholder.png", status="ongoing", start_date="2023-06-01", research_area_id=2),
    Project(title="Consectetur Adipiscing Initiative", description_html=p(LOREM_L), image_path="/uploads/projects/placeholder.png", status="ongoing", start_date="2024-06-01", research_area_id=4),
    Project(title="Sed Do Eiusmod Project", description_html=pp(LOREM_L, LOREM_M), image_path="/uploads/projects/placeholder.png", status="completed", start_date="2022-01-01", end_date="2024-06-01", research_area_id=1),
    Project(title="Tempor Incididunt Research", description_html=p(LOREM_L), image_path="/uploads/projects/placeholder.png", status="ongoing", start_date="2024-09-01", research_area_id=3),
]
db.add_all(projects)
db.commit()

db.add_all([
    ProjectTag(project_id=1, tag_id=1), ProjectTag(project_id=1, tag_id=5), ProjectTag(project_id=1, tag_id=7),
    ProjectTag(project_id=2, tag_id=2), ProjectTag(project_id=2, tag_id=6),
    ProjectTag(project_id=3, tag_id=3), ProjectTag(project_id=3, tag_id=4),
    ProjectTag(project_id=4, tag_id=1), ProjectTag(project_id=4, tag_id=5),
    ProjectTag(project_id=5, tag_id=3), ProjectTag(project_id=5, tag_id=8),
])

# --- News ---
news_items = [
    News(title="Lorem ipsum dolor sit amet consectetur", summary=LOREM_M, content_html=p(LOREM_XL), image_path="/uploads/news/placeholder.png", source_name="Lorem Source", source_url="https://example.com", published_date="2025-09-15", is_featured=True),
    News(title="Ut enim ad minim veniam quis nostrud", summary=LOREM_M, content_html=p(LOREM_XL), image_path="/uploads/news/placeholder.png", source_name="Ipsum Journal", source_url="https://example.com", published_date="2025-08-20"),
    News(title="Duis aute irure dolor in reprehenderit", summary=LOREM_M, content_html=p(LOREM_XL), image_path="/uploads/news/placeholder.png", source_name="Dolor News", source_url="https://example.com", published_date="2025-08-10"),
    News(title="Excepteur sint occaecat cupidatat non proident", summary=LOREM_M, content_html=p(LOREM_XL), image_path="/uploads/news/placeholder.png", source_name="Amet Press", source_url="https://example.com", published_date="2025-07-01"),
    News(title="Nulla pariatur sed ut perspiciatis unde omnis", summary=LOREM_M, content_html=p(LOREM_XL), image_path="/uploads/news/placeholder.png", source_name="Consectetur Times", source_url="https://example.com", published_date="2025-06-15"),
    News(title="At vero eos et accusamus et iusto odio", summary=LOREM_M, content_html=p(LOREM_XL), image_path="/uploads/news/placeholder.png", source_name="Adipiscing Weekly", source_url="https://example.com", published_date="2025-05-20"),
]
db.add_all(news_items)

# --- Events ---
events = [
    Event(title="Lorem Ipsum Workshop", description_html=p(LOREM_L), image_path="/uploads/events/placeholder.png", event_date="2026-07-15", start_time="09:00", end_time="17:00", venue="ICSR Auditorium, IIT Madras"),
    Event(title="Dolor Sit Guest Lecture", description_html=p(LOREM_M), image_path="/uploads/events/placeholder.png", event_date="2026-06-20", start_time="14:00", end_time="15:30", venue="CS Department Seminar Hall, IIT Madras"),
    Event(title="Annual Review Meeting 2026", description_html=p(LOREM_M), image_path="/uploads/events/placeholder.png", event_date="2026-03-10", start_time="10:00", end_time="16:00", venue="WSAI Conference Room, IIT Madras"),
    Event(title="Consectetur Adipiscing Tutorial", description_html=p(LOREM_M), image_path="/uploads/events/placeholder.png", event_date="2026-08-05", start_time="09:30", end_time="13:00", venue="CDS Lab 201, IIT Madras"),
]
db.add_all(events)

# --- Gallery ---
cat_events = GalleryCategory(name="Events", slug="events", display_order=1)
cat_lab = GalleryCategory(name="Lab", slug="lab", display_order=2)
cat_team = GalleryCategory(name="Team", slug="team", display_order=3)
cat_conferences = GalleryCategory(name="Conferences", slug="conferences", display_order=4)
db.add_all([cat_events, cat_lab, cat_team, cat_conferences])
db.commit()

gallery_images = [
    GalleryImage(image_path="/uploads/gallery/placeholder.png", caption="Lorem Ipsum Workshop 2025", alt_text="Lorem ipsum dolor sit amet", event_name="Lorem Workshop", date_taken="2025-07-15", category_id=1, display_order=1),
    GalleryImage(image_path="/uploads/gallery/placeholder.png", caption="Lab Setup", alt_text="Dolor sit amet consectetur", event_name="Lab Inauguration", date_taken="2024-01-15", category_id=2, display_order=1),
    GalleryImage(image_path="/uploads/gallery/placeholder.png", caption="Team Photo 2025", alt_text="Adipiscing elit sed do eiusmod", event_name="Annual Review 2025", date_taken="2025-03-10", category_id=3, display_order=1),
    GalleryImage(image_path="/uploads/gallery/placeholder.png", caption="Conference Presentation", alt_text="Ut enim ad minim veniam", event_name="Lorem Conference 2024", date_taken="2024-12-10", category_id=4, display_order=1),
    GalleryImage(image_path="/uploads/gallery/placeholder.png", caption="Guest Lecture", alt_text="Quis nostrud exercitation ullamco", event_name="Guest Lecture Series", date_taken="2025-04-22", category_id=1, display_order=2),
    GalleryImage(image_path="/uploads/gallery/placeholder.png", caption="Lab Equipment", alt_text="Laboris nisi ut aliquip commodo", event_name="Lab Equipment", date_taken="2024-06-01", category_id=2, display_order=2),
    GalleryImage(image_path="/uploads/gallery/placeholder.png", caption="Farewell Celebration", alt_text="Duis aute irure dolor reprehenderit", event_name="Farewell Celebration", date_taken="2023-12-20", category_id=3, display_order=2),
    GalleryImage(image_path="/uploads/gallery/placeholder.png", caption="Dolor Conference 2025", alt_text="Voluptate velit esse cillum dolore", event_name="Dolor Conference 2025", date_taken="2025-08-10", category_id=4, display_order=2),
]
db.add_all(gallery_images)

# --- Testimonials ---
testimonials = [
    Testimonial(quote_text=LOREM_XL, person_name="Aditya Raghavan", person_role="Former MS Scholar, Dept. of DSAI", person_photo_path="/uploads/testimonials/placeholder.png", display_order=1),
    Testimonial(quote_text=LOREM_L, person_name="Nisha Iyer", person_role="Former PhD Scholar, Dept. of DSAI", person_photo_path="/uploads/testimonials/placeholder.png", display_order=2),
    Testimonial(quote_text=LOREM_M, person_name="Rahul Desai", person_role="Former Post-Bacc Fellow, Dept. of DSAI", person_photo_path="/uploads/testimonials/placeholder.png", display_order=3),
]
db.add_all(testimonials)

# --- Sponsors ---
sponsors = [
    Sponsor(name="Sponsor One", logo_path="/uploads/sponsors/placeholder.png", website_url="https://example.com", description=LOREM_S, sponsor_type="sponsor", display_order=1),
    Sponsor(name="Sponsor Two", logo_path="/uploads/sponsors/placeholder.png", website_url="https://example.com", description=LOREM_S, sponsor_type="sponsor", display_order=2),
    Sponsor(name="Collaborator One", logo_path="/uploads/sponsors/placeholder.png", website_url="https://example.com", description=LOREM_S, sponsor_type="collaborator", display_order=3),
    Sponsor(name="Collaborator Two", logo_path="/uploads/sponsors/placeholder.png", website_url="https://example.com", description=LOREM_S, sponsor_type="collaborator", display_order=4),
    Sponsor(name="Sponsor Three", logo_path="/uploads/sponsors/placeholder.png", website_url="https://example.com", description=LOREM_S, sponsor_type="sponsor", display_order=5),
]
db.add_all(sponsors)

# --- Links ---
links_data = [
    Link(title="Lorem GitHub", url="https://github.com", description=LOREM_S, icon="github", category="github", display_order=1),
    Link(title="Ipsum Newsletter", url="https://example.com", description=LOREM_S, icon="mail", category="newsletter", display_order=2),
    Link(title="Dolor Blog", url="https://example.com", description=LOREM_S, icon="book", category="blog", display_order=3),
    Link(title="Amet Resource", url="https://example.com", description=LOREM_S, icon="globe", category="resource", display_order=4),
    Link(title="Consectetur Portal", url="https://example.com", description=LOREM_S, icon="graduation-cap", category="resource", display_order=5),
]
db.add_all(links_data)

# --- Openings ---
openings = [
    Opening(position_title="Lorem Ipsum Position", position_type="phd", description_html=p(LOREM_XL), requirements_html=f"<ul><li>{LOREM_S}</li><li>{LOREM_S}</li><li>{LOREM_S}</li></ul>", deadline="2026-12-31", apply_url="https://research.iitm.ac.in", is_active=True),
    Opening(position_title="Dolor Sit Research Fellow", position_type="postdoc", description_html=pp(LOREM_L, LOREM_M), requirements_html=f"<ul><li>{LOREM_S}</li><li>{LOREM_S}</li><li>{LOREM_S}</li></ul>", deadline="2026-09-30", apply_url="https://research.iitm.ac.in", is_active=True),
    Opening(position_title="Amet Consectetur Fellowship", position_type="postbacc", description_html=pp(LOREM_L, LOREM_M), requirements_html=f"<ul><li>{LOREM_S}</li><li>{LOREM_S}</li></ul>", apply_url="https://research.iitm.ac.in", is_active=True),
    Opening(position_title="Adipiscing Internship 2026", position_type="internship", description_html=p(LOREM_L), requirements_html=f"<ul><li>{LOREM_S}</li><li>{LOREM_S}</li></ul>", deadline="2026-03-15", apply_url="https://research.iitm.ac.in", is_active=True),
]
db.add_all(openings)

# --- Flowcharts ---
fc1 = Flowchart(title="BTech to PhD Pathway", description=LOREM_M, display_order=1)
fc2 = Flowchart(title="MS/Direct PhD Pathway", description=LOREM_M, display_order=2)
fc3 = Flowchart(title="Post-Doctoral & Post-Bacc Pathway", description=LOREM_M, display_order=3)
db.add_all([fc1, fc2, fc3])
db.commit()

fc1_nodes = [
    FlowchartNode(flowchart_id=fc1.id, node_id="1", label="BTech/BE Graduate", position_x=250, position_y=0, node_type="input"),
    FlowchartNode(flowchart_id=fc1.id, node_id="2", label="GATE Qualification", position_x=100, position_y=100),
    FlowchartNode(flowchart_id=fc1.id, node_id="3", label="MS by Research at IITM", position_x=100, position_y=200),
    FlowchartNode(flowchart_id=fc1.id, node_id="4", label="Convert MS to PhD", position_x=100, position_y=300),
    FlowchartNode(flowchart_id=fc1.id, node_id="5", label="Direct PhD (Exceptional)", position_x=400, position_y=100),
    FlowchartNode(flowchart_id=fc1.id, node_id="6", label="PhD at SIMHA", position_x=250, position_y=400, node_type="output"),
]
db.add_all(fc1_nodes)

fc1_edges = [
    FlowchartEdge(flowchart_id=fc1.id, edge_id="e1-2", source_node_id="1", target_node_id="2", label="Via GATE"),
    FlowchartEdge(flowchart_id=fc1.id, edge_id="e1-5", source_node_id="1", target_node_id="5", label="Exceptional record"),
    FlowchartEdge(flowchart_id=fc1.id, edge_id="e2-3", source_node_id="2", target_node_id="3", label="Apply via research.iitm.ac.in"),
    FlowchartEdge(flowchart_id=fc1.id, edge_id="e3-4", source_node_id="3", target_node_id="4", label="After coursework"),
    FlowchartEdge(flowchart_id=fc1.id, edge_id="e4-6", source_node_id="4", target_node_id="6"),
    FlowchartEdge(flowchart_id=fc1.id, edge_id="e5-6", source_node_id="5", target_node_id="6"),
]
db.add_all(fc1_edges)

fc2_nodes = [
    FlowchartNode(flowchart_id=fc2.id, node_id="1", label="M.Tech/MS Graduate", position_x=250, position_y=0, node_type="input"),
    FlowchartNode(flowchart_id=fc2.id, node_id="2", label="GATE Score / Interview", position_x=250, position_y=100),
    FlowchartNode(flowchart_id=fc2.id, node_id="3", label="Apply on research.iitm.ac.in", position_x=250, position_y=200),
    FlowchartNode(flowchart_id=fc2.id, node_id="4", label="Faculty Interview", position_x=250, position_y=300),
    FlowchartNode(flowchart_id=fc2.id, node_id="5", label="PhD at SIMHA", position_x=250, position_y=400, node_type="output"),
]
db.add_all(fc2_nodes)

fc2_edges = [
    FlowchartEdge(flowchart_id=fc2.id, edge_id="e1-2", source_node_id="1", target_node_id="2", label="Qualify GATE"),
    FlowchartEdge(flowchart_id=fc2.id, edge_id="e2-3", source_node_id="2", target_node_id="3", label="Submit application"),
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
    FlowchartEdge(flowchart_id=fc3.id, edge_id="e1-3", source_node_id="1", target_node_id="3", label="Apply via email"),
    FlowchartEdge(flowchart_id=fc3.id, edge_id="e2-4", source_node_id="2", target_node_id="4", label="Apply via email"),
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
        content_html=f"<h2>Lorem Ipsum</h2>{p(LOREM_XL)}<h2>Dolor Sit Amet</h2>{p(LOREM_XL)}<h2>Consectetur</h2>{p(LOREM_XL)}<h2>Adipiscing Elit</h2>{p(LOREM_XL)}",
        excerpt=LOREM_M,
        cover_image_path="/uploads/blog/placeholder.png",
        author_id=4, is_published=True, published_date="2025-06-15"
    ),
    BlogPost(
        title="Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
        slug="sed-do-eiusmod-tempor-incididunt",
        content_html=f"<h2>Sed Do Eiusmod</h2>{p(LOREM_XL)}<h2>Tempor Incididunt</h2>{p(LOREM_XL)}<h2>Ut Labore</h2>{p(LOREM_XL)}<h2>Dolore Magna</h2>{p(LOREM_XL)}",
        excerpt=LOREM_M,
        cover_image_path="/uploads/blog/placeholder.png",
        author_id=5, is_published=True, published_date="2025-05-01"
    ),
    BlogPost(
        title="Ut enim ad minim veniam quis nostrud exercitation ullamco",
        slug="ut-enim-ad-minim-veniam",
        content_html=f"<h2>Ut Enim</h2>{p(LOREM_XL)}<h2>Ad Minim Veniam</h2>{p(LOREM_XL)}<h2>Quis Nostrud</h2>{p(LOREM_XL)}",
        excerpt=LOREM_M,
        cover_image_path="/uploads/blog/placeholder.png",
        author_id=6, is_published=True, published_date="2025-03-20"
    ),
]
db.add_all(blog_posts)

# --- Contact Info ---
contact = ContactInfo(
    phone="+91-44-2257-XXXX",
    email="simha@iitm.ac.in",
    address_html="<p>SIMHA<br>Wadhwani School of Data Science and AI<br>IIT Madras<br>Chennai - 600036<br>Tamil Nadu, India</p>",
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
    SiteSetting(key="footer_text", value="SIMHA — Secure Intelligent Models and Hardware Architecture | Wadhwani School of Data Science and AI | IIT Madras", value_type="text"),
]
db.add_all(site_settings)

db.commit()
db.close()

print("Database seeded successfully!")

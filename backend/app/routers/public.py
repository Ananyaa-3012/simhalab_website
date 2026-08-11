from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
from datetime import date

from ..database import get_db
from ..models import (
    CarouselSlide, LabHeadMessage, Announcement, Person, Publication,
    ResearchArea, Project, Tag, News, Event, GalleryCategory, GalleryImage,
    Testimonial, Sponsor, Link, Opening, Flowchart, FlowchartNode,
    FlowchartEdge, ContactInfo, BlogPost, SiteSetting, PublicationAuthor,
    Download,
)

router = APIRouter(prefix="/api/public", tags=["public"])


@router.get("/carousel")
def get_carousel(db: Session = Depends(get_db)):
    slides = db.query(CarouselSlide).filter(
        CarouselSlide.is_active == True
    ).order_by(CarouselSlide.display_order).all()
    return slides


@router.get("/lab-head")
def get_lab_head(db: Session = Depends(get_db)):
    msg = db.query(LabHeadMessage).first()
    if not msg:
        return None
    return msg


@router.get("/announcements")
def get_announcements(db: Session = Depends(get_db)):
    today = date.today().isoformat()
    announcements = db.query(Announcement).filter(
        Announcement.is_active == True,
    ).order_by(Announcement.display_order).all()
    result = []
    for a in announcements:
        if a.start_date and a.start_date > today:
            continue
        if a.end_date and a.end_date < today:
            continue
        result.append(a)
    return result


@router.get("/people")
def get_people(category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Person).filter(Person.is_active == True)
    if category:
        query = query.filter(Person.category == category)
    return query.order_by(Person.display_order).all()


@router.get("/people/{person_id}")
def get_person(person_id: int, db: Session = Depends(get_db)):
    person = db.query(Person).filter(Person.id == person_id, Person.is_active == True).first()
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")

    pub_ids = db.query(PublicationAuthor.publication_id).filter(
        PublicationAuthor.person_id == person_id
    ).all()
    publications = []
    if pub_ids:
        publications = db.query(Publication).filter(
            Publication.id.in_([p[0] for p in pub_ids])
        ).order_by(desc(Publication.year)).all()

    return {"person": person, "publications": publications}


@router.get("/publications")
def get_publications(
    year: Optional[int] = None,
    pub_type: Optional[str] = None,
    area: Optional[int] = None,
    search: Optional[str] = None,
    sort_by: str = "year",
    sort_order: str = "desc",
    page: int = 1,
    per_page: int = 20,
    db: Session = Depends(get_db),
):
    query = db.query(Publication)
    if year:
        query = query.filter(Publication.year == year)
    if pub_type:
        query = query.filter(Publication.pub_type == pub_type)
    if area:
        query = query.filter(Publication.research_area_id == area)
    if search:
        query = query.filter(
            Publication.title.ilike(f"%{search}%") | Publication.authors.ilike(f"%{search}%")
        )

    total = query.count()

    sort_col = getattr(Publication, sort_by, Publication.year)
    if sort_order == "desc":
        query = query.order_by(desc(sort_col))
    else:
        query = query.order_by(sort_col)

    items = query.offset((page - 1) * per_page).limit(per_page).all()
    return {
        "items": items,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": (total + per_page - 1) // per_page,
    }


@router.get("/research-areas")
def get_research_areas(db: Session = Depends(get_db)):
    return db.query(ResearchArea).filter(
        ResearchArea.is_active == True
    ).order_by(ResearchArea.display_order).all()


@router.get("/research-areas/{area_id}")
def get_research_area(area_id: int, db: Session = Depends(get_db)):
    from datetime import datetime
    area = db.query(ResearchArea).filter(
        ResearchArea.id == area_id, ResearchArea.is_active == True
    ).first()
    if not area:
        raise HTTPException(status_code=404, detail="Research area not found")

    current_year = datetime.now().year
    min_year = current_year - 2
    publications = db.query(Publication).filter(
        Publication.research_area_id == area_id,
        Publication.year >= min_year,
    ).order_by(desc(Publication.year), desc(Publication.month)).all()

    contact_person = None
    if area.contact_person_id:
        contact_person = db.query(Person).filter(
            Person.id == area.contact_person_id
        ).first()

    return {
        "area": area,
        "publications": publications,
        "contact_person": contact_person,
    }


@router.get("/projects")
def get_projects(
    status: Optional[str] = None,
    area: Optional[int] = None,
    tag: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Project).filter(Project.is_active == True)
    if status:
        query = query.filter(Project.status == status)
    if area:
        query = query.filter(Project.research_area_id == area)
    if tag:
        query = query.join(Project.tags).filter(Tag.slug == tag)
    return query.all()


@router.get("/news")
def get_news(year: Optional[int] = None, page: int = 1, per_page: int = 12, db: Session = Depends(get_db)):
    query = db.query(News).filter(News.is_active == True)
    if year:
        query = query.filter(News.published_date.like(f"{year}%"))
    total = query.count()
    items = query.order_by(desc(News.published_date)).offset((page - 1) * per_page).limit(per_page).all()
    return {"items": items, "total": total, "page": page, "per_page": per_page}


@router.get("/events")
def get_events(year: Optional[int] = None, page: int = 1, per_page: int = 12, db: Session = Depends(get_db)):
    query = db.query(Event).filter(Event.is_active == True)
    if year:
        query = query.filter(Event.event_date.like(f"{year}%"))
    total = query.count()
    items = query.order_by(desc(Event.event_date)).offset((page - 1) * per_page).limit(per_page).all()
    return {"items": items, "total": total, "page": page, "per_page": per_page}


@router.get("/gallery-categories")
def get_gallery_categories(db: Session = Depends(get_db)):
    return db.query(GalleryCategory).order_by(GalleryCategory.display_order).all()


@router.get("/gallery")
def get_gallery(category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(GalleryImage)
    if category:
        query = query.join(GalleryCategory).filter(GalleryCategory.slug == category)
    return query.order_by(GalleryImage.display_order).all()


@router.get("/testimonials")
def get_testimonials(db: Session = Depends(get_db)):
    return db.query(Testimonial).filter(
        Testimonial.is_active == True
    ).order_by(Testimonial.display_order).all()


@router.get("/sponsors")
def get_sponsors(sponsor_type: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Sponsor).filter(Sponsor.is_active == True)
    if sponsor_type:
        query = query.filter(Sponsor.sponsor_type == sponsor_type)
    return query.order_by(Sponsor.display_order).all()


@router.get("/links")
def get_links(category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Link).filter(Link.is_active == True)
    if category:
        query = query.filter(Link.category == category)
    return query.order_by(Link.display_order).all()


@router.get("/openings")
def get_openings(db: Session = Depends(get_db)):
    today = date.today().isoformat()
    return db.query(Opening).filter(
        Opening.is_active == True,
    ).all()


@router.get("/flowcharts")
def get_flowcharts(db: Session = Depends(get_db)):
    flowcharts = db.query(Flowchart).filter(
        Flowchart.is_active == True
    ).order_by(Flowchart.display_order).all()

    result = []
    for fc in flowcharts:
        nodes = db.query(FlowchartNode).filter(FlowchartNode.flowchart_id == fc.id).all()
        edges = db.query(FlowchartEdge).filter(FlowchartEdge.flowchart_id == fc.id).all()
        result.append({
            "id": fc.id,
            "title": fc.title,
            "description": fc.description,
            "nodes": nodes,
            "edges": edges,
        })
    return result


@router.get("/blog")
def get_blog(page: int = 1, per_page: int = 12, search: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(BlogPost).filter(BlogPost.is_published == True)
    if search:
        query = query.filter(BlogPost.title.ilike(f"%{search}%"))
    total = query.count()
    items = query.order_by(desc(BlogPost.published_date)).offset((page - 1) * per_page).limit(per_page).all()
    return {"items": items, "total": total, "page": page, "per_page": per_page}


@router.get("/blog/{slug}")
def get_blog_post(slug: str, db: Session = Depends(get_db)):
    post = db.query(BlogPost).filter(BlogPost.slug == slug, BlogPost.is_published == True).first()
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
    return post


@router.get("/contact-info")
def get_contact_info(db: Session = Depends(get_db)):
    return db.query(ContactInfo).first()


@router.get("/site-settings")
def get_site_settings(db: Session = Depends(get_db)):
    settings = db.query(SiteSetting).all()
    return {s.key: s.value for s in settings}


@router.get("/downloads")
def get_downloads(db: Session = Depends(get_db)):
    return db.query(Download).filter(
        Download.is_active == True
    ).order_by(Download.display_order).all()

import io
import csv
import json
import zipfile
import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Optional
from pathlib import Path

from ..database import get_db
from ..auth.jwt import get_current_admin
from ..models import (
    CarouselSlide, LabHeadMessage, Announcement, Person, Publication,
    PublicationAuthor, ResearchArea, Project, Tag, ProjectTag, ProjectMember,
    News, Event, GalleryCategory, GalleryImage, Testimonial, Sponsor, Link,
    Opening, Flowchart, FlowchartNode, FlowchartEdge, ContactInfo, BlogPost,
    SiteSetting, AdminUser, Download,
)
from ..utils.sanitize import sanitize_html
from ..utils.upload import save_upload
from ..schemas.common import ReorderItem

router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(get_current_admin)])


# --- File Upload ---
@router.post("/upload")
async def upload_file(file: UploadFile = File(...), content_type: str = "general", subdir: str = "", filename: str = ""):
    folder = subdir or content_type
    path = await save_upload(file, folder, filename=filename or None)
    return {"path": path}


# --- Bulk Import ---
IMPORT_CONFIGS = {
    "people": {
        "model": Person,
        "required": ["name"],
        "fields": ["name","role","designation","department","category","email","phone",
                   "github_url","google_scholar_url","personal_website_url","linkedin_url",
                   "orcid_url","display_order","is_active","image_filename"],
        "booleans": ["is_active"],
        "integers": ["display_order"],
        "enums": {"category": ["faculty","postdoc","phd","ms","postbacc","project_associate","intern","alumni"]},
        "defaults": {"category": "phd", "is_active": True, "display_order": 0},
        "virtual_fields": ["image_filename"],  # not stored directly on model
    },
    "publications": {
        "model": Publication,
        "required": ["title","authors"],
        "fields": ["title","authors","venue","year","month","pub_type","doi_url","pdf_url","is_featured","research_area_id"],
        "booleans": ["is_featured"],
        "integers": ["year","month","research_area_id"],
        "enums": {"pub_type": ["journal","conference","preprint","book_chapter","thesis"]},
        "defaults": {"pub_type": "conference", "is_featured": False},
    },
    "projects": {
        "model": Project,
        "required": ["title"],
        "fields": ["title","status","start_date","end_date","research_area_id","is_active"],
        "booleans": ["is_active"],
        "integers": ["research_area_id"],
        "dates": ["start_date","end_date"],
        "enums": {"status": ["ongoing","completed"]},
        "defaults": {"status": "ongoing", "is_active": True},
    },
    "news": {
        "model": News,
        "required": ["title","published_date"],
        "fields": ["title","summary","source_name","source_url","published_date","is_featured","is_active"],
        "booleans": ["is_featured","is_active"],
        "dates": ["published_date"],
        "defaults": {"is_active": True, "is_featured": False},
    },
    "events": {
        "model": Event,
        "required": ["title","event_date"],
        "fields": ["title","event_date","end_date","start_time","end_time","venue","event_url","is_active"],
        "booleans": ["is_active"],
        "dates": ["event_date","end_date"],
        "defaults": {"is_active": True},
    },
    "openings": {
        "model": Opening,
        "required": ["position_title"],
        "fields": ["position_title","position_type","deadline","apply_url","is_active"],
        "booleans": ["is_active"],
        "dates": ["deadline"],
        "enums": {"position_type": ["phd","postdoc","postbacc","internship","other"]},
        "defaults": {"position_type": "other", "is_active": True},
    },
    "testimonials": {
        "model": Testimonial,
        "required": ["quote_text","person_name"],
        "fields": ["quote_text","person_name","person_role","organization","display_order","is_active"],
        "booleans": ["is_active"],
        "integers": ["display_order"],
        "defaults": {"is_active": True, "display_order": 0},
    },
    "sponsors": {
        "model": Sponsor,
        "required": ["name"],
        "fields": ["name","website_url","sponsor_type","display_order","is_active"],
        "booleans": ["is_active"],
        "integers": ["display_order"],
        "enums": {"sponsor_type": ["sponsor","collaborator"]},
        "defaults": {"sponsor_type": "sponsor", "is_active": True, "display_order": 0},
    },
    "announcements": {
        "model": Announcement,
        "required": ["title"],
        "fields": ["title","description","link_url","link_text","announcement_type","start_date","end_date","is_active"],
        "booleans": ["is_active"],
        "dates": ["start_date","end_date"],
        "enums": {"announcement_type": ["recruitment","general","urgent"]},
        "defaults": {"announcement_type": "general", "is_active": True},
    },
}


@router.post("/import/{resource}")
async def import_resource(resource: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    if resource not in IMPORT_CONFIGS:
        raise HTTPException(status_code=400, detail=f"Import not supported for: {resource}")

    config = IMPORT_CONFIGS[resource]
    content = await file.read()

    try:
        if file.filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(content))
        else:
            df = pd.read_excel(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse file: {str(e)}")

    # Normalize column names: lowercase, replace spaces with underscores
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

    imported, skipped = 0, 0
    errors = []

    for idx, row in df.iterrows():
        row_num = idx + 2  # 1-based, +1 for header

        # Check required fields
        missing = []
        for req in config["required"]:
            val = row.get(req)
            if val is None or (isinstance(val, float) and pd.isna(val)) or str(val).strip() == "":
                missing.append(req)
        if missing:
            errors.append(f"Row {row_num}: missing required field(s): {', '.join(missing)}")
            skipped += 1
            continue

        # Build model kwargs
        kwargs = dict(config.get("defaults", {}))

        virtual_fields = set(config.get("virtual_fields", []))
        image_filename = None

        for field in config["fields"]:
            val = row.get(field)
            if val is None or (isinstance(val, float) and pd.isna(val)):
                continue
            val = str(val).strip()
            if val == "" or val == "nan":
                continue

            # Virtual fields — capture but don't pass to model
            if field in virtual_fields:
                if field == "image_filename":
                    image_filename = val
                continue

            # Boolean fields
            if field in config.get("booleans", []):
                kwargs[field] = val.lower() in ("1", "true", "yes")
                continue

            # Integer fields
            if field in config.get("integers", []):
                try:
                    kwargs[field] = int(float(val))
                except (ValueError, TypeError):
                    pass
                continue

            # Date fields
            if field in config.get("dates", []):
                try:
                    parsed = pd.to_datetime(val, errors="coerce")
                    if not pd.isna(parsed):
                        kwargs[field] = parsed.strftime("%Y-%m-%d")
                except Exception:
                    pass
                continue

            # Enum fields
            enums = config.get("enums", {})
            if field in enums:
                if val.lower() in enums[field]:
                    kwargs[field] = val.lower()
                else:
                    kwargs[field] = config["defaults"].get(field, enums[field][0])
                continue

            kwargs[field] = val

        try:
            obj = config["model"](**kwargs)
            # For people with image_filename, set photo_path to a pending placeholder
            # (actual image matched when ZIP is uploaded)
            if image_filename and hasattr(obj, "photo_path") and not obj.photo_path:
                obj.photo_path = f"/uploads/people/{image_filename}"
            db.add(obj)
            db.commit()
            imported += 1
        except Exception as e:
            db.rollback()
            errors.append(f"Row {row_num}: {str(e)}")
            skipped += 1

    return {"imported": imported, "skipped": skipped, "errors": errors}


@router.get("/import/{resource}/template")
def get_import_template(resource: str):
    if resource not in IMPORT_CONFIGS:
        raise HTTPException(status_code=400, detail=f"No template for: {resource}")
    config = IMPORT_CONFIGS[resource]
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(config["fields"])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={resource}_template.csv"}
    )


# --- Generic CRUD helpers ---
def _get_or_404(db: Session, model, item_id: int):
    item = db.query(model).filter(model.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Not found")
    return item


def _sanitize_fields(data: dict, html_fields: list[str]) -> dict:
    for field in html_fields:
        if field in data and data[field]:
            data[field] = sanitize_html(data[field])
    return data


# --- Carousel ---
@router.get("/carousel")
def list_carousel(db: Session = Depends(get_db)):
    return db.query(CarouselSlide).order_by(CarouselSlide.display_order).all()


@router.get("/carousel/{item_id}")
def get_carousel(item_id: int, db: Session = Depends(get_db)):
    return _get_or_404(db, CarouselSlide, item_id)


@router.post("/carousel")
def create_carousel(data: dict, db: Session = Depends(get_db)):
    item = CarouselSlide(**data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/carousel/{item_id}")
def update_carousel(item_id: int, data: dict, db: Session = Depends(get_db)):
    item = _get_or_404(db, CarouselSlide, item_id)
    for k, v in data.items():
        if hasattr(item, k):
            setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/carousel/{item_id}")
def delete_carousel(item_id: int, db: Session = Depends(get_db)):
    item = _get_or_404(db, CarouselSlide, item_id)
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}


# --- Lab Head Message ---
@router.get("/lab-head")
def get_lab_head(db: Session = Depends(get_db)):
    return db.query(LabHeadMessage).first()


@router.put("/lab-head")
def update_lab_head(data: dict, db: Session = Depends(get_db)):
    data = _sanitize_fields(data, ["message_html"])
    msg = db.query(LabHeadMessage).first()
    if not msg:
        msg = LabHeadMessage(**data)
        db.add(msg)
    else:
        for k, v in data.items():
            if hasattr(msg, k):
                setattr(msg, k, v)
    db.commit()
    db.refresh(msg)
    return msg


# --- Announcements ---
@router.get("/announcements")
def list_announcements(db: Session = Depends(get_db)):
    return db.query(Announcement).order_by(Announcement.display_order).all()


@router.get("/announcements/{item_id}")
def get_announcement(item_id: int, db: Session = Depends(get_db)):
    return _get_or_404(db, Announcement, item_id)


@router.post("/announcements")
def create_announcement(data: dict, db: Session = Depends(get_db)):
    item = Announcement(**data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/announcements/{item_id}")
def update_announcement(item_id: int, data: dict, db: Session = Depends(get_db)):
    item = _get_or_404(db, Announcement, item_id)
    for k, v in data.items():
        if hasattr(item, k):
            setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/announcements/{item_id}")
def delete_announcement(item_id: int, db: Session = Depends(get_db)):
    item = _get_or_404(db, Announcement, item_id)
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}


# --- People ---
@router.get("/people")
def list_people(category: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Person)
    if category:
        query = query.filter(Person.category == category)
    return query.order_by(Person.display_order).all()


@router.get("/people/{item_id}")
def get_person(item_id: int, db: Session = Depends(get_db)):
    return _get_or_404(db, Person, item_id)


@router.post("/people")
def create_person(data: dict, db: Session = Depends(get_db)):
    data = _sanitize_fields(data, ["bio_html"])
    item = Person(**data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/people/{item_id}")
def update_person(item_id: int, data: dict, db: Session = Depends(get_db)):
    data = _sanitize_fields(data, ["bio_html"])
    item = _get_or_404(db, Person, item_id)
    for k, v in data.items():
        if hasattr(item, k):
            if isinstance(v, (list, dict)):
                v = json.dumps(v)
            setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/people/{item_id}")
def delete_person(item_id: int, db: Session = Depends(get_db)):
    item = _get_or_404(db, Person, item_id)
    db.query(ResearchArea).filter(ResearchArea.contact_person_id == item_id).update(
        {"contact_person_id": None}
    )
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}


# --- Publications ---
@router.get("/publications")
def list_publications(page: int = 1, per_page: int = 20, db: Session = Depends(get_db)):
    total = db.query(Publication).count()
    items = db.query(Publication).order_by(Publication.id.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {"items": items, "total": total, "page": page, "per_page": per_page}


@router.get("/publications/{item_id}")
def get_publication(item_id: int, db: Session = Depends(get_db)):
    pub = _get_or_404(db, Publication, item_id)
    linked = db.query(PublicationAuthor).filter(PublicationAuthor.publication_id == item_id).all()
    return {"publication": pub, "linked_author_ids": [l.person_id for l in linked]}


@router.post("/publications")
def create_publication(data: dict, db: Session = Depends(get_db)):
    data = _sanitize_fields(data, ["abstract_html"])
    linked_ids = data.pop("linked_author_ids", [])
    item = Publication(**data)
    db.add(item)
    db.commit()
    db.refresh(item)
    for i, pid in enumerate(linked_ids):
        db.add(PublicationAuthor(publication_id=item.id, person_id=pid, author_order=i))
    db.commit()
    return item


@router.put("/publications/{item_id}")
def update_publication(item_id: int, data: dict, db: Session = Depends(get_db)):
    data = _sanitize_fields(data, ["abstract_html"])
    linked_ids = data.pop("linked_author_ids", None)
    item = _get_or_404(db, Publication, item_id)
    for k, v in data.items():
        if hasattr(item, k):
            setattr(item, k, v)
    if linked_ids is not None:
        db.query(PublicationAuthor).filter(PublicationAuthor.publication_id == item_id).delete()
        for i, pid in enumerate(linked_ids):
            db.add(PublicationAuthor(publication_id=item_id, person_id=pid, author_order=i))
    db.commit()
    db.refresh(item)
    return item


@router.delete("/publications/{item_id}")
def delete_publication(item_id: int, db: Session = Depends(get_db)):
    item = _get_or_404(db, Publication, item_id)
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}


# --- Research Areas ---
@router.get("/research-areas")
def list_research_areas(db: Session = Depends(get_db)):
    return db.query(ResearchArea).order_by(ResearchArea.display_order).all()


@router.get("/research-areas/{item_id}")
def get_research_area(item_id: int, db: Session = Depends(get_db)):
    return _get_or_404(db, ResearchArea, item_id)


@router.post("/research-areas")
def create_research_area(data: dict, db: Session = Depends(get_db)):
    data = _sanitize_fields(data, ["description_html"])
    item = ResearchArea(**data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/research-areas/{item_id}")
def update_research_area(item_id: int, data: dict, db: Session = Depends(get_db)):
    data = _sanitize_fields(data, ["description_html"])
    item = _get_or_404(db, ResearchArea, item_id)
    for k, v in data.items():
        if hasattr(item, k):
            setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/research-areas/{item_id}")
def delete_research_area(item_id: int, db: Session = Depends(get_db)):
    item = _get_or_404(db, ResearchArea, item_id)
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}


# --- Projects ---
@router.get("/projects")
def list_projects(db: Session = Depends(get_db)):
    return db.query(Project).all()


@router.get("/projects/{item_id}")
def get_project(item_id: int, db: Session = Depends(get_db)):
    return _get_or_404(db, Project, item_id)


@router.post("/projects")
def create_project(data: dict, db: Session = Depends(get_db)):
    data = _sanitize_fields(data, ["description_html"])
    tags = data.pop("tags", [])
    members = data.pop("members", [])
    item = Project(**data)
    db.add(item)
    db.commit()
    db.refresh(item)
    for tag_slug in tags:
        tag = db.query(Tag).filter(Tag.slug == tag_slug).first()
        if not tag:
            tag = Tag(name=tag_slug.replace("-", " ").title(), slug=tag_slug)
            db.add(tag)
            db.commit()
            db.refresh(tag)
        db.add(ProjectTag(project_id=item.id, tag_id=tag.id))
    for m in members:
        db.add(ProjectMember(project_id=item.id, person_id=m["person_id"], role=m.get("role")))
    db.commit()
    return item


@router.put("/projects/{item_id}")
def update_project(item_id: int, data: dict, db: Session = Depends(get_db)):
    data = _sanitize_fields(data, ["description_html"])
    tags = data.pop("tags", None)
    members = data.pop("members", None)
    item = _get_or_404(db, Project, item_id)
    for k, v in data.items():
        if hasattr(item, k):
            setattr(item, k, v)
    if tags is not None:
        db.query(ProjectTag).filter(ProjectTag.project_id == item_id).delete()
        for tag_slug in tags:
            tag = db.query(Tag).filter(Tag.slug == tag_slug).first()
            if not tag:
                tag = Tag(name=tag_slug.replace("-", " ").title(), slug=tag_slug)
                db.add(tag)
                db.commit()
                db.refresh(tag)
            db.add(ProjectTag(project_id=item_id, tag_id=tag.id))
    if members is not None:
        db.query(ProjectMember).filter(ProjectMember.project_id == item_id).delete()
        for m in members:
            db.add(ProjectMember(project_id=item_id, person_id=m["person_id"], role=m.get("role")))
    db.commit()
    db.refresh(item)
    return item


@router.delete("/projects/{item_id}")
def delete_project(item_id: int, db: Session = Depends(get_db)):
    item = _get_or_404(db, Project, item_id)
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}


# --- News ---
@router.get("/news")
def list_news(db: Session = Depends(get_db)):
    return db.query(News).order_by(News.id.desc()).all()


@router.get("/news/{item_id}")
def get_news(item_id: int, db: Session = Depends(get_db)):
    return _get_or_404(db, News, item_id)


@router.post("/news")
def create_news(data: dict, db: Session = Depends(get_db)):
    data = _sanitize_fields(data, ["content_html"])
    item = News(**data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/news/{item_id}")
def update_news(item_id: int, data: dict, db: Session = Depends(get_db)):
    data = _sanitize_fields(data, ["content_html"])
    item = _get_or_404(db, News, item_id)
    for k, v in data.items():
        if hasattr(item, k):
            setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/news/{item_id}")
def delete_news(item_id: int, db: Session = Depends(get_db)):
    item = _get_or_404(db, News, item_id)
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}


# --- Events ---
@router.get("/events")
def list_events(db: Session = Depends(get_db)):
    return db.query(Event).order_by(Event.id.desc()).all()


@router.get("/events/{item_id}")
def get_event(item_id: int, db: Session = Depends(get_db)):
    return _get_or_404(db, Event, item_id)


@router.post("/events")
def create_event(data: dict, db: Session = Depends(get_db)):
    data = _sanitize_fields(data, ["description_html"])
    item = Event(**data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/events/{item_id}")
def update_event(item_id: int, data: dict, db: Session = Depends(get_db)):
    data = _sanitize_fields(data, ["description_html"])
    item = _get_or_404(db, Event, item_id)
    for k, v in data.items():
        if hasattr(item, k):
            setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/events/{item_id}")
def delete_event(item_id: int, db: Session = Depends(get_db)):
    item = _get_or_404(db, Event, item_id)
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}


# --- Gallery ---
@router.get("/gallery-categories")
def list_gallery_categories(db: Session = Depends(get_db)):
    return db.query(GalleryCategory).order_by(GalleryCategory.display_order).all()


@router.post("/gallery-categories")
def create_gallery_category(data: dict, db: Session = Depends(get_db)):
    item = GalleryCategory(**data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/gallery-categories/{item_id}")
def delete_gallery_category(item_id: int, db: Session = Depends(get_db)):
    item = _get_or_404(db, GalleryCategory, item_id)
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}


@router.get("/gallery")
def list_gallery(db: Session = Depends(get_db)):
    return db.query(GalleryImage).order_by(GalleryImage.display_order).all()


@router.get("/gallery/{item_id}")
def get_gallery_image(item_id: int, db: Session = Depends(get_db)):
    return _get_or_404(db, GalleryImage, item_id)


@router.post("/gallery")
def create_gallery_image(data: dict, db: Session = Depends(get_db)):
    item = GalleryImage(**data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/gallery/{item_id}")
def update_gallery_image(item_id: int, data: dict, db: Session = Depends(get_db)):
    item = _get_or_404(db, GalleryImage, item_id)
    for k, v in data.items():
        if hasattr(item, k):
            setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/gallery/{item_id}")
def delete_gallery_image(item_id: int, db: Session = Depends(get_db)):
    item = _get_or_404(db, GalleryImage, item_id)
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}


# --- Testimonials ---
@router.get("/testimonials")
def list_testimonials(db: Session = Depends(get_db)):
    return db.query(Testimonial).order_by(Testimonial.display_order).all()


@router.get("/testimonials/{item_id}")
def get_testimonial(item_id: int, db: Session = Depends(get_db)):
    return _get_or_404(db, Testimonial, item_id)


@router.post("/testimonials")
def create_testimonial(data: dict, db: Session = Depends(get_db)):
    item = Testimonial(**data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/testimonials/{item_id}")
def update_testimonial(item_id: int, data: dict, db: Session = Depends(get_db)):
    item = _get_or_404(db, Testimonial, item_id)
    for k, v in data.items():
        if hasattr(item, k):
            setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/testimonials/{item_id}")
def delete_testimonial(item_id: int, db: Session = Depends(get_db)):
    item = _get_or_404(db, Testimonial, item_id)
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}


# --- Sponsors ---
@router.get("/sponsors")
def list_sponsors(db: Session = Depends(get_db)):
    return db.query(Sponsor).order_by(Sponsor.display_order).all()


@router.get("/sponsors/{item_id}")
def get_sponsor(item_id: int, db: Session = Depends(get_db)):
    return _get_or_404(db, Sponsor, item_id)


@router.post("/sponsors")
def create_sponsor(data: dict, db: Session = Depends(get_db)):
    item = Sponsor(**data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/sponsors/{item_id}")
def update_sponsor(item_id: int, data: dict, db: Session = Depends(get_db)):
    item = _get_or_404(db, Sponsor, item_id)
    for k, v in data.items():
        if hasattr(item, k):
            setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/sponsors/{item_id}")
def delete_sponsor(item_id: int, db: Session = Depends(get_db)):
    item = _get_or_404(db, Sponsor, item_id)
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}


# --- Links ---
@router.get("/links")
def list_links(db: Session = Depends(get_db)):
    return db.query(Link).order_by(Link.display_order).all()


@router.get("/links/{item_id}")
def get_link(item_id: int, db: Session = Depends(get_db)):
    return _get_or_404(db, Link, item_id)


@router.post("/links")
def create_link(data: dict, db: Session = Depends(get_db)):
    item = Link(**data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/links/{item_id}")
def update_link(item_id: int, data: dict, db: Session = Depends(get_db)):
    item = _get_or_404(db, Link, item_id)
    for k, v in data.items():
        if hasattr(item, k):
            setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/links/{item_id}")
def delete_link(item_id: int, db: Session = Depends(get_db)):
    item = _get_or_404(db, Link, item_id)
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}


# --- Openings ---
@router.get("/openings")
def list_openings(db: Session = Depends(get_db)):
    return db.query(Opening).all()


@router.get("/openings/{item_id}")
def get_opening(item_id: int, db: Session = Depends(get_db)):
    return _get_or_404(db, Opening, item_id)


@router.post("/openings")
def create_opening(data: dict, db: Session = Depends(get_db)):
    data = _sanitize_fields(data, ["description_html", "requirements_html"])
    item = Opening(**data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/openings/{item_id}")
def update_opening(item_id: int, data: dict, db: Session = Depends(get_db)):
    data = _sanitize_fields(data, ["description_html", "requirements_html"])
    item = _get_or_404(db, Opening, item_id)
    for k, v in data.items():
        if hasattr(item, k):
            setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/openings/{item_id}")
def delete_opening(item_id: int, db: Session = Depends(get_db)):
    item = _get_or_404(db, Opening, item_id)
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}


# --- Flowcharts ---
@router.get("/flowcharts")
def list_flowcharts(db: Session = Depends(get_db)):
    return db.query(Flowchart).order_by(Flowchart.display_order).all()


@router.get("/flowcharts/{item_id}")
def get_flowchart(item_id: int, db: Session = Depends(get_db)):
    fc = _get_or_404(db, Flowchart, item_id)
    nodes = db.query(FlowchartNode).filter(FlowchartNode.flowchart_id == item_id).all()
    edges = db.query(FlowchartEdge).filter(FlowchartEdge.flowchart_id == item_id).all()
    return {"flowchart": fc, "nodes": nodes, "edges": edges}


@router.post("/flowcharts")
def create_flowchart(data: dict, db: Session = Depends(get_db)):
    nodes_data = data.pop("nodes", [])
    edges_data = data.pop("edges", [])
    fc = Flowchart(**data)
    db.add(fc)
    db.commit()
    db.refresh(fc)
    for n in nodes_data:
        db.add(FlowchartNode(flowchart_id=fc.id, **n))
    for e in edges_data:
        db.add(FlowchartEdge(flowchart_id=fc.id, **e))
    db.commit()
    return fc


@router.put("/flowcharts/{item_id}")
def update_flowchart(item_id: int, data: dict, db: Session = Depends(get_db)):
    fc = _get_or_404(db, Flowchart, item_id)
    nodes_data = data.pop("nodes", None)
    edges_data = data.pop("edges", None)
    for k, v in data.items():
        if hasattr(fc, k):
            setattr(fc, k, v)
    if nodes_data is not None:
        db.query(FlowchartNode).filter(FlowchartNode.flowchart_id == item_id).delete()
        for n in nodes_data:
            db.add(FlowchartNode(flowchart_id=item_id, **n))
    if edges_data is not None:
        db.query(FlowchartEdge).filter(FlowchartEdge.flowchart_id == item_id).delete()
        for e in edges_data:
            db.add(FlowchartEdge(flowchart_id=item_id, **e))
    db.commit()
    db.refresh(fc)
    return fc


@router.delete("/flowcharts/{item_id}")
def delete_flowchart(item_id: int, db: Session = Depends(get_db)):
    item = _get_or_404(db, Flowchart, item_id)
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}


# --- Blog ---
@router.get("/blog")
def list_blog(db: Session = Depends(get_db)):
    return db.query(BlogPost).order_by(BlogPost.id.desc()).all()


@router.get("/blog/{item_id}")
def get_blog_post(item_id: int, db: Session = Depends(get_db)):
    return _get_or_404(db, BlogPost, item_id)


@router.post("/blog")
def create_blog_post(data: dict, db: Session = Depends(get_db)):
    data = _sanitize_fields(data, ["content_html"])
    item = BlogPost(**data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/blog/{item_id}")
def update_blog_post(item_id: int, data: dict, db: Session = Depends(get_db)):
    data = _sanitize_fields(data, ["content_html"])
    item = _get_or_404(db, BlogPost, item_id)
    for k, v in data.items():
        if hasattr(item, k):
            setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/blog/{item_id}")
def delete_blog_post(item_id: int, db: Session = Depends(get_db)):
    item = _get_or_404(db, BlogPost, item_id)
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}


# --- Contact Info ---
@router.get("/contact-info")
def get_contact_info(db: Session = Depends(get_db)):
    return db.query(ContactInfo).first()


@router.put("/contact-info")
def update_contact_info(data: dict, db: Session = Depends(get_db)):
    data = _sanitize_fields(data, ["address_html"])
    info = db.query(ContactInfo).first()
    if not info:
        info = ContactInfo(**data)
        db.add(info)
    else:
        for k, v in data.items():
            if hasattr(info, k):
                setattr(info, k, v)
    db.commit()
    db.refresh(info)
    return info


# --- Site Settings ---
@router.get("/site-settings")
def list_site_settings(db: Session = Depends(get_db)):
    return db.query(SiteSetting).all()


@router.put("/site-settings")
def update_site_settings(data: dict, db: Session = Depends(get_db)):
    key = data.get("key")
    value = data.get("value")
    if not key:
        return {"error": "Missing key"}
    setting = db.query(SiteSetting).filter(SiteSetting.key == key).first()
    if setting:
        setting.value = value
    else:
        db.add(SiteSetting(key=key, value=value))
    db.commit()
    return {"message": "Settings updated"}


# --- Downloads ---
@router.get("/downloads")
def list_downloads(db: Session = Depends(get_db)):
    return db.query(Download).order_by(Download.display_order).all()


@router.get("/downloads/{item_id}")
def get_download(item_id: int, db: Session = Depends(get_db)):
    return _get_or_404(db, Download, item_id)


@router.post("/downloads")
def create_download(data: dict, db: Session = Depends(get_db)):
    item = Download(**data)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/downloads/{item_id}")
def update_download(item_id: int, data: dict, db: Session = Depends(get_db)):
    item = _get_or_404(db, Download, item_id)
    for k, v in data.items():
        if hasattr(item, k):
            setattr(item, k, v)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/downloads/{item_id}")
def delete_download(item_id: int, db: Session = Depends(get_db)):
    item = _get_or_404(db, Download, item_id)
    db.delete(item)
    db.commit()
    return {"message": "Deleted"}


# --- People Image ZIP Upload ---
@router.post("/people/upload-images-zip")
async def upload_people_images_zip(
    zip_file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Accept a ZIP of images. For each image, if a Person record has a matching
    image_filename stored in their photo_path as a basename, update their photo_path.
    Returns list of {filename, saved_path, person_id} for matched files.
    """
    ALLOWED_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
    uploads_dir = Path("uploads/people")
    uploads_dir.mkdir(parents=True, exist_ok=True)

    zip_bytes = await zip_file.read()
    results = []
    try:
        with zipfile.ZipFile(io.BytesIO(zip_bytes)) as zf:
            for member in zf.infolist():
                if member.is_dir():
                    continue
                fname = Path(member.filename).name
                ext = Path(fname).suffix.lower()
                if ext not in ALLOWED_EXTS:
                    continue
                # Validate magic bytes for the first 8 bytes
                raw = zf.read(member)
                magic = raw[:8]
                is_image = (
                    magic[:4] == b'\x89PNG' or
                    magic[:2] == b'\xff\xd8' or
                    magic[:4] in (b'RIFF', b'WEBP') or
                    magic[:6] in (b'GIF87a', b'GIF89a')
                )
                if not is_image:
                    continue

                dest = uploads_dir / fname
                dest.write_bytes(raw)
                saved_path = f"/uploads/people/{fname}"

                # Try to find a person whose photo_path basename matches
                person = db.query(Person).filter(
                    Person.photo_path.like(f"%{fname}")
                ).first()
                if person:
                    person.photo_path = saved_path
                    db.commit()
                    results.append({"filename": fname, "saved_path": saved_path, "person_id": person.id})
                else:
                    results.append({"filename": fname, "saved_path": saved_path, "person_id": None})
    except zipfile.BadZipFile:
        raise HTTPException(status_code=400, detail="Invalid ZIP file")

    return {"uploaded": len(results), "files": results}


# --- Reorder ---
@router.put("/reorder/{resource}")
def reorder_resource(resource: str, items: list[ReorderItem], db: Session = Depends(get_db)):
    model_map = {
        "carousel": CarouselSlide,
        "announcements": Announcement,
        "people": Person,
        "research-areas": ResearchArea,
        "gallery": GalleryImage,
        "testimonials": Testimonial,
        "sponsors": Sponsor,
        "links": Link,
        "flowcharts": Flowchart,
    }
    model = model_map.get(resource)
    if not model:
        raise HTTPException(status_code=400, detail="Invalid resource")
    for item in items:
        obj = db.query(model).filter(model.id == item.id).first()
        if obj:
            obj.display_order = item.display_order
    db.commit()
    return {"message": "Reordered"}

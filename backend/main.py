from pathlib import Path

from fastapi import (
    FastAPI,
    HTTPException
)

from fastapi.responses import (
    FileResponse
)

from fastapi.staticfiles import (
    StaticFiles
)

from models import (
    DrawRequest
)

from kuji_service import (
    draw_kuji,
    get_kuji_detail,
    get_kuji_list
)


# =========================================================
# 폴더
# =========================================================

BACKEND_DIR = (
    Path(__file__)
    .resolve()
    .parent
)

PROJECT_DIR = (
    BACKEND_DIR
    .parent
)

CSS_DIR = (
    PROJECT_DIR
    /
    "css"
)

JS_DIR = (
    PROJECT_DIR
    /
    "js"
)


# =========================================================
# FastAPI
# =========================================================

app = FastAPI(
    title="KUJI POP",
    version="1.0.0"
)


# =========================================================
# CSS / JS
# =========================================================

app.mount(
    "/css",

    StaticFiles(
        directory=CSS_DIR
    ),

    name="css"
)


app.mount(
    "/js",

    StaticFiles(
        directory=JS_DIR
    ),

    name="js"
)

app.mount(
    "/images",
    StaticFiles(directory=PROJECT_DIR / "images"),
    name="images"
)


# =========================================================
# 프론트
# =========================================================

@app.get("/")
async def home():

    return FileResponse(
        PROJECT_DIR
        /
        "index.html"
    )


@app.get(
    "/detail.html"
)
async def detail_page():

    return FileResponse(
        PROJECT_DIR
        /
        "detail.html"
    )


@app.get(
    "/draw.html"
)
async def draw_page():

    return FileResponse(
        PROJECT_DIR
        /
        "draw.html"
    )


# =========================================================
# Health
# =========================================================

@app.get(
    "/api/health"
)
async def health():

    return {
        "status":
            "ok",

        "service":
            "KUJI POP API"
    }


# =========================================================
# 상품 목록
# =========================================================

@app.get(
    "/api/kuji"
)
async def kuji_list():

    return get_kuji_list()


# =========================================================
# 상품 상세
# =========================================================

@app.get(
    "/api/kuji/{kuji_id}"
)
async def kuji_detail(
    kuji_id: str
):

    try:

        return get_kuji_detail(
            kuji_id
        )


    except ValueError as error:

        raise HTTPException(
            status_code=404,
            detail=str(error)
        )


# =========================================================
# 추첨
# =========================================================

@app.post(
    "/api/draw"
)
async def draw(
    request: DrawRequest
):

    try:

        return await draw_kuji(
            request.kujiId,
            request.count
        )


    except ValueError as error:

        raise HTTPException(
            status_code=409,
            detail=str(error)
        )

from pathlib import Path

from fastapi import (
    FastAPI,
    HTTPException
)

from fastapi.middleware.cors import (
    CORSMiddleware
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
    get_kuji_detail
)


# =========================================================
# 경로 설정
# =========================================================

BACKEND_DIR = Path(__file__).resolve().parent

PROJECT_DIR = BACKEND_DIR.parent

CSS_DIR = PROJECT_DIR / "css"

JS_DIR = PROJECT_DIR / "js"


# =========================================================
# FastAPI
# =========================================================

app = FastAPI(
    title="KUJI POP",
    version="1.0.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "*"
    ],

    allow_credentials=False,

    allow_methods=[
        "*"
    ],

    allow_headers=[
        "*"
    ]
)


# =========================================================
# 정적 파일
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


# =========================================================
# 프론트 페이지
# =========================================================

@app.get("/")
async def home():

    return FileResponse(
        PROJECT_DIR
        /
        "index.html"
    )


@app.get("/detail.html")
async def detail_page():

    return FileResponse(
        PROJECT_DIR
        /
        "detail.html"
    )


@app.get("/draw.html")
async def draw_page():

    return FileResponse(
        PROJECT_DIR
        /
        "draw.html"
    )


# =========================================================
# 서버 상태
# =========================================================

@app.get("/health")
async def health():

    return {
        "status": "ok",
        "service": "KUJI POP API"
    }


# =========================================================
# 쿠지 상세 API
# =========================================================

@app.get("/kuji/{kuji_id}")
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
# 추첨 API
# =========================================================

@app.post("/draw")
async def draw(
    request: DrawRequest
):

    try:

        result = await draw_kuji(
            request.kujiId,
            request.count
        )

        return result

    except ValueError as error:

        raise HTTPException(
            status_code=409,
            detail=str(error)
        )
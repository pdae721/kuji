from fastapi import (
    FastAPI,
    HTTPException
)

from fastapi.middleware.cors import (
    CORSMiddleware
)


from models import (
    DrawRequest
)


from kuji_service import (
    draw_kuji,
    get_kuji_detail
)


# =========================================================
# 앱 생성
# =========================================================

app = FastAPI(
    title="KUJI POP API",
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
# health check
# =========================================================

@app.get(
    "/health"
)
async def health():

    return {
        "status":
            "ok",

        "service":
            "KUJI POP API"
    }


# =========================================================
# 쿠지 상세 조회
# =========================================================

@app.get(
    "/kuji/{kuji_id}"
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
    "/draw"
)
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
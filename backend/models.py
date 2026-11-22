from pydantic import (
    BaseModel,
    Field
)


class DrawRequest(
    BaseModel
):

    kujiId: str

    count: int = Field(
        ge=1,
        le=10
    )
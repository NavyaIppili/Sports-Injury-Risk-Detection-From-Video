from pydantic import BaseModel


class AthleteProfileBase(BaseModel):
    full_name: str
    age: int
    gender: str
    height: str
    weight: str
    sport: str
    playing_position: str
    training_load: str
    previous_injuries: str


class AthleteProfileCreate(AthleteProfileBase):
    pass


class AthleteProfileRead(AthleteProfileBase):
    id: int | None = None

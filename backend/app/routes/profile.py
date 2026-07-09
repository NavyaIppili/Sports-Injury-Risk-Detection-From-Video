from fastapi import APIRouter

router = APIRouter(prefix='/profile', tags=['profile'])


@router.get('/template')
def profile_template():
    return {
        'message': 'Athlete profile API placeholder',
        'fields': [
            'fullName',
            'age',
            'gender',
            'height',
            'weight',
            'sport',
            'playingPosition',
            'trainingLoad',
            'previousInjuries',
        ],
    }

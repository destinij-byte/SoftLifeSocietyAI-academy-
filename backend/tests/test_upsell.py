from bson import ObjectId

from app.academy.services.upsell import pick_recommended_next


def test_pick_recommended_next_returns_id_when_set():
    next_id = ObjectId()
    course = {"recommended_next_course_id": next_id}
    assert pick_recommended_next(course) == str(next_id)


def test_pick_recommended_next_returns_none_when_unset():
    assert pick_recommended_next({}) is None
    assert pick_recommended_next({"recommended_next_course_id": None}) is None

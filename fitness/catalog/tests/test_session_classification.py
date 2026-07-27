from __future__ import annotations

import unittest

from fitness.data import classify, performed_exercises


class SessionClassificationTest(unittest.TestCase):
    def test_strength_exercises_win_over_cardio_mode_finisher(self) -> None:
        session = {
            "sessionMode": "cardio",
            "activity": {"type": "hiit", "duration": "5"},
            "exercises": [
                {
                    "id": "061",
                    "name": "Frontkniebeuge",
                    "setsArray": [{"weight": "60", "reps": "5"}],
                }
            ],
        }

        self.assertEqual(classify(session), "strength+addon")
        self.assertEqual([ex["id"] for ex in performed_exercises(session)], ["061"])

    def test_activity_without_exercise_signal_stays_cardio(self) -> None:
        session = {
            "sessionMode": "cardio",
            "activity": {"type": "swimming", "duration": "60"},
            "exercises": [{"id": "061", "name": "Frontkniebeuge", "setsArray": [{"weight": "", "reps": ""}]}],
        }

        self.assertEqual(classify(session), "cardio")
        self.assertEqual(performed_exercises(session), [])


if __name__ == "__main__":
    unittest.main()

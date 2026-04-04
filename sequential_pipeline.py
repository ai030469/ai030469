"""
Sequential Agent Pipeline
-------------------------
שלב 1: Plan   — מקבל משימה ובונה תוכנית פעולה
שלב 2: Execute — מבצע את התוכנית שלב אחר שלב
שלב 3: Document — מייצר תיעוד מוגמר מוכן לשימוש

שימוש:
    python sequential_pipeline.py
"""

import anthropic

# -----------------------------------------------------------------------
# הגדרות
# -----------------------------------------------------------------------
MODEL = "claude-opus-4-6"
MAX_TOKENS = 16000

client = anthropic.Anthropic()  # קורא ANTHROPIC_API_KEY מהסביבה


# -----------------------------------------------------------------------
# שלב 1 — Plan: תכנון
# -----------------------------------------------------------------------
def plan(task: str) -> str:
    """
    מקבל תיאור משימה ומחזיר תוכנית פעולה מפורטת.
    """
    print("\n[שלב 1 — תכנון]")

    response = client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        thinking={"type": "adaptive"},  # Claude חושב לעומק לפני שמתכנן
        system=(
            "אתה מתכנן תפעולי מנוסה. "
            "קבל משימה ופרק אותה לשלבים ברורים וישימים. "
            "כל שלב — פעולה אחת, ברמת פעולה מדויקת. "
            "ציין לכל שלב: מה, מי אחראי, מה הסיכון."
        ),
        messages=[
            {
                "role": "user",
                "content": f"תכנן את ביצוע המשימה הבאה:\n\n{task}",
            }
        ],
    )

    # שלוף את בלוק הטקסט מהתשובה
    plan_text = next(
        block.text for block in response.content if block.type == "text"
    )
    print(plan_text)
    return plan_text


# -----------------------------------------------------------------------
# שלב 2 — Execute: ביצוע
# -----------------------------------------------------------------------
def execute(task: str, plan_text: str) -> str:
    """
    מקבל את התוכנית ומחזיר תוצר מלא לכל שלב.
    """
    print("\n[שלב 2 — ביצוע]")

    response = client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        system=(
            "אתה מבצע תפעולי. "
            "קבל תוכנית פעולה ובצע כל שלב — "
            "כתוב את התוצר המלא לכל שלב (מייל, הודעה, טבלה, נוהל). "
            "אל תסביר — תייצר תוצר ישים מיידית."
        ),
        messages=[
            {
                "role": "user",
                "content": (
                    f"משימה מקורית:\n{task}\n\n"
                    f"תוכנית מאושרת:\n{plan_text}\n\n"
                    "בצע כל שלב ותן תוצר מוגמר לכל אחד."
                ),
            }
        ],
    )

    execution_text = next(
        block.text for block in response.content if block.type == "text"
    )
    print(execution_text)
    return execution_text


# -----------------------------------------------------------------------
# שלב 3 — Document: תיעוד
# -----------------------------------------------------------------------
def document(task: str, plan_text: str, execution_text: str) -> str:
    """
    מקבל תוכנית + ביצוע ומחזיר דוח סיכום מוכן להדבקה.
    """
    print("\n[שלב 3 — תיעוד]")

    response = client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        system=(
            "אתה מתעד תפעולי. "
            "קבל תוכנית וביצוע ויצר דוח סיכום תפעולי מובנה: "
            "כותרת, תאריך, מה בוצע, מי מעורב, סטטוס, הערות. "
            "פורמט: מוכן להעתקה לוואטסאפ / גוגל דוקס / מייל."
        ),
        messages=[
            {
                "role": "user",
                "content": (
                    f"משימה:\n{task}\n\n"
                    f"תוכנית:\n{plan_text}\n\n"
                    f"ביצוע:\n{execution_text}\n\n"
                    "צור דוח סיכום תפעולי."
                ),
            }
        ],
    )

    doc_text = next(
        block.text for block in response.content if block.type == "text"
    )
    print(doc_text)
    return doc_text


# -----------------------------------------------------------------------
# Pipeline — הרצה מלאה
# -----------------------------------------------------------------------
def run_pipeline(task: str) -> dict:
    """
    מריץ את שלושת השלבים ברצף ומחזיר את כל התוצרים.
    """
    print(f"\n{'='*60}")
    print(f"משימה: {task}")
    print(f"{'='*60}")

    # שלב 1
    plan_result = plan(task)

    # שלב 2 — מקבל את תוצאת שלב 1
    execution_result = execute(task, plan_result)

    # שלב 3 — מקבל את תוצאות שלב 1+2
    document_result = document(task, plan_result, execution_result)

    print(f"\n{'='*60}")
    print("Pipeline הושלם בהצלחה.")
    print(f"{'='*60}")

    return {
        "task": task,
        "plan": plan_result,
        "execution": execution_result,
        "document": document_result,
    }


# -----------------------------------------------------------------------
# הרצה
# -----------------------------------------------------------------------
if __name__ == "__main__":
    # דוגמה — החלף בכל משימה תפעולית
    TASK = (
        "מקפיא ראשי הושבת. "
        "יש לתאם ניוד סחורה למקפיאים חלופיים, "
        "לקרוא לטכנאי, ולעדכן את כל ממשקי השטח."
    )

    results = run_pipeline(TASK)

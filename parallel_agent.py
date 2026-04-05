"""
Parallel Execution Agent
------------------------
Supervisor Agent שמפעיל Sub-Agents במקביל.

מבנה:
  Main Agent (Supervisor)
    ├── Sub-Agent A — תיעוד תקלה
    ├── Sub-Agent B — תיאום ממשקים
    └── Sub-Agent C — בניית נוהל

כל Sub-Agent רץ במקביל ← חוסך זמן.
בסוף: Supervisor מאחד את כל התוצאות לדוח אחד.

שימוש:
    python parallel_agent.py
"""

import asyncio
import anthropic

# -----------------------------------------------------------------------
# הגדרות
# -----------------------------------------------------------------------
MODEL = "claude-opus-4-6"
MAX_TOKENS = 16000

client = anthropic.AsyncAnthropic()  # גרסה אסינכרונית לריצה מקבילה


# -----------------------------------------------------------------------
# Sub-Agent — רץ משימה אחת
# -----------------------------------------------------------------------
async def run_sub_agent(agent_name: str, task: str, context: str) -> dict:
    """
    מריץ Sub-Agent יחיד עם משימה ממוקדת.
    מחזיר: שם ה-agent + תוצר.
    """
    print(f"  ▶ [{agent_name}] מתחיל...")

    response = await client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        system=(
            f"אתה {agent_name}. "
            "בצע את המשימה שלך בלבד — תוצר מוגמר, ישים, קופי-רדי. "
            "ללא הקדמות, ללא הסברים."
        ),
        messages=[
            {
                "role": "user",
                "content": f"הקשר:\n{context}\n\nמשימה:\n{task}",
            }
        ],
    )

    result = next(
        (b.text for b in response.content if b.type == "text"), ""
    )

    print(f"  ✓ [{agent_name}] הושלם")
    return {"agent": agent_name, "task": task, "result": result}


# -----------------------------------------------------------------------
# Supervisor — מפעיל Sub-Agents במקביל ומאחד תוצאות
# -----------------------------------------------------------------------
async def run_parallel_agents(incident: str) -> str:
    """
    1. מגדיר 3 משימות מקבילות
    2. מריץ אותן בו-זמנית
    3. מאחד הכל לדוח סיכום
    """
    print(f"\n{'='*60}")
    print(f"אירוע: {incident}")
    print(f"{'='*60}\n")
    print("מפעיל Sub-Agents במקביל...\n")

    # הגדרת 3 משימות מקבילות — כל אחת עצמאית
    sub_tasks = [
        {
            "agent": "סוכן תיעוד",
            "task": (
                "כתוב מייל תיעוד תקלה מובנה לכל הממשקים: "
                "תפעול, הסעדה, טכנאים, ניקיון, תחזוקה. "
                "כלול: שעה, תיאור, פעולות שבוצעו, סטטוס."
            ),
        },
        {
            "agent": "סוכן תיאום",
            "task": (
                "בנה רשימת תיאום ממשקים: "
                "מי צריך לעשות מה ומתי. "
                "פורמט טבלה: ממשק | פעולה | אחראי | זמן."
            ),
        },
        {
            "agent": "סוכן נוהל",
            "task": (
                "כתוב נוהל מניעה לעתיד: "
                "שלבים ברמת פעולה מדויקת למניעת הישנות האירוע. "
                "כלול: תדירות בדיקה, אחראי, פעולה."
            ),
        },
    ]

    # הרצה מקבילה — כל Sub-Agent רץ בו-זמנית
    tasks = [
        run_sub_agent(t["agent"], t["task"], incident)
        for t in sub_tasks
    ]
    results = await asyncio.gather(*tasks)

    # -----------------------------------------------------------------------
    # Supervisor מאחד את כל התוצאות
    # -----------------------------------------------------------------------
    print(f"\n{'='*60}")
    print("Supervisor מאחד תוצאות...")

    combined = "\n\n".join(
        f"=== {r['agent']} ===\n{r['result']}" for r in results
    )

    supervisor_response = await client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        system=(
            "אתה Supervisor תפעולי. "
            "קיבלת תוצאות מ-3 Sub-Agents. "
            "אחד אותם לדוח סיכום אחד מובנה, ללא כפילויות. "
            "פורמט: מוכן לשליחה מיידית."
        ),
        messages=[
            {
                "role": "user",
                "content": (
                    f"אירוע:\n{incident}\n\n"
                    f"תוצאות Sub-Agents:\n{combined}\n\n"
                    "אחד לדוח סיכום אחד."
                ),
            }
        ],
    )

    final = next(
        (b.text for b in supervisor_response.content if b.type == "text"), ""
    )

    print(f"\n[דוח סיכום מאוחד]\n{final}")
    return final


# -----------------------------------------------------------------------
# הרצה
# -----------------------------------------------------------------------
if __name__ == "__main__":
    INCIDENT = (
        "מקפיא ראשי הושבת בשעה 09:30. "
        "סחורה בשווי גבוה בסיכון. "
        "טכנאי הוזמן — הגעה צפויה בעוד שעה."
    )

    asyncio.run(run_parallel_agents(INCIDENT))

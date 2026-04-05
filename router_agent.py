"""
Router Agent
------------
Agent שמנתב בקשות לנתיב הנכון לפי תוכן הבקשה.

מבנה:
  בקשה נכנסת
      ↓
  Router (Claude מחליט)
      ├── Route A: תקלה תפעולית  → sequential_pipeline
      ├── Route B: תיאום אירוע   → parallel_agent
      ├── Route C: שאילתת מידע   → תשובה ישירה
      └── Route D: בניית נוהל   → tools_agent

שימוש:
    python router_agent.py
"""

import json
import anthropic

# -----------------------------------------------------------------------
# הגדרות
# -----------------------------------------------------------------------
MODEL = "claude-opus-4-6"
MAX_TOKENS = 4000  # הRouter צריך תשובה קצרה בלבד

client = anthropic.Anthropic()

# -----------------------------------------------------------------------
# הגדרת נתיבים
# -----------------------------------------------------------------------
ROUTES = {
    "incident": {
        "description": "תקלה תפעולית — ציוד, מקפיא, חשמל, מים, מערכות",
        "handler": "sequential_pipeline",
        "action": "Plan → Execute → Document",
    },
    "event": {
        "description": "תיאום אירוע — ניוד ציוד, תפריט, לוגיסטיקה",
        "handler": "parallel_agent",
        "action": "3 Sub-Agents במקביל",
    },
    "query": {
        "description": "שאילתת מידע — שאלה, בקשת הסבר, נתונים",
        "handler": "direct",
        "action": "תשובה ישירה",
    },
    "procedure": {
        "description": "בניית נוהל — נוהל חדש, עדכון נוהל קיים",
        "handler": "tools_agent",
        "action": "כלים + תיעוד",
    },
}

# -----------------------------------------------------------------------
# כלי ניתוב — Claude משתמש בו להחליט לאן לנתב
# -----------------------------------------------------------------------
ROUTER_TOOL = [
    {
        "name": "route_request",
        "description": "מנתב בקשה לנתיב המתאים ביותר.",
        "input_schema": {
            "type": "object",
            "properties": {
                "route": {
                    "type": "string",
                    "enum": ["incident", "event", "query", "procedure"],
                    "description": "הנתיב שנבחר",
                },
                "reason": {
                    "type": "string",
                    "description": "הסבר קצר למה נבחר נתיב זה",
                },
                "priority": {
                    "type": "string",
                    "enum": ["קריטי", "גבוה", "בינוני", "נמוך"],
                    "description": "רמת דחיפות הבקשה",
                },
            },
            "required": ["route", "reason", "priority"],
        },
    }
]


# -----------------------------------------------------------------------
# Router — Claude מחליט לאן לנתב
# -----------------------------------------------------------------------
def route(request: str) -> dict:
    """
    שולח את הבקשה ל-Claude שמחליט איזה נתיב מתאים.
    מחזיר: route, reason, priority.
    """
    routes_desc = "\n".join(
        f"  {k}: {v['description']}" for k, v in ROUTES.items()
    )

    response = client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        tools=ROUTER_TOOL,
        tool_choice={"type": "tool", "name": "route_request"},  # חייב להשתמש בכלי
        system=(
            "אתה Router תפעולי. "
            "קרא את הבקשה ונתב אותה לנתיב הנכון מבין האפשרויות הבאות:\n"
            f"{routes_desc}\n"
            "החלט לפי תוכן הבקשה בלבד."
        ),
        messages=[{"role": "user", "content": request}],
    )

    # שלוף את החלטת הניתוב
    for block in response.content:
        if block.type == "tool_use":
            return block.input

    return {"route": "query", "reason": "ברירת מחדל", "priority": "נמוך"}


# -----------------------------------------------------------------------
# Handlers — פעולה לפי נתיב
# -----------------------------------------------------------------------
def handle_incident(request: str, priority: str) -> str:
    """תקלה — Sequential Pipeline מדומה."""
    return (
        f"[Sequential Pipeline]\n"
        f"עדיפות: {priority}\n"
        f"שלב 1 — תכנון: מזהה ממשקים רלוונטיים...\n"
        f"שלב 2 — ביצוע: מתעד תקלה ומתאם...\n"
        f"שלב 3 — תיעוד: מייצר מייל + דוח סיכום.\n\n"
        f"[בפרויקט אמיתי: קורא ל-sequential_pipeline.py]"
    )


def handle_event(request: str, priority: str) -> str:
    """אירוע — Parallel Agent מדומה."""
    return (
        f"[Parallel Agent]\n"
        f"עדיפות: {priority}\n"
        f"מפעיל 3 Sub-Agents במקביל:\n"
        f"  ▶ סוכן לוגיסטיקה\n"
        f"  ▶ סוכן ציוד\n"
        f"  ▶ סוכן תיאום ממשקים\n\n"
        f"[בפרויקט אמיתי: קורא ל-parallel_agent.py]"
    )


def handle_query(request: str) -> str:
    """שאילתה — תשובה ישירה מ-Claude."""
    response = client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        system=(
            "אתה עוזר תפעולי. ענה ישיר, קצר, מדויק. "
            "רק עובדות ופעולות — ללא דעות."
        ),
        messages=[{"role": "user", "content": request}],
    )
    return next((b.text for b in response.content if b.type == "text"), "")


def handle_procedure(request: str, priority: str) -> str:
    """נוהל — Tools Agent מדומה."""
    return (
        f"[Tools Agent]\n"
        f"עדיפות: {priority}\n"
        f"בונה נוהל חדש ומוסיף ל-procedures.md...\n\n"
        f"[בפרויקט אמיתי: קורא ל-tools_agent.py]"
    )


# -----------------------------------------------------------------------
# ניתוב ראשי
# -----------------------------------------------------------------------
def dispatch(request: str) -> str:
    """
    מנתב בקשה לנתיב הנכון ומחזיר תוצר.
    """
    print(f"\n{'='*60}")
    print(f"בקשה: {request}")
    print(f"{'='*60}")

    # שלב 1: Claude מחליט לאן לנתב
    decision = route(request)
    chosen_route = decision.get("route", "query")
    reason = decision.get("reason", "")
    priority = decision.get("priority", "בינוני")

    route_info = ROUTES[chosen_route]

    print(f"\n  🔀 נתיב נבחר: {chosen_route.upper()}")
    print(f"  📋 פעולה: {route_info['action']}")
    print(f"  ⚡ עדיפות: {priority}")
    print(f"  💬 סיבה: {reason}\n")

    # שלב 2: הפעל Handler מתאים
    if chosen_route == "incident":
        result = handle_incident(request, priority)
    elif chosen_route == "event":
        result = handle_event(request, priority)
    elif chosen_route == "query":
        result = handle_query(request)
    elif chosen_route == "procedure":
        result = handle_procedure(request, priority)
    else:
        result = handle_query(request)

    print(f"\n[תוצר]\n{result}")
    return result


# -----------------------------------------------------------------------
# הרצה — 4 דוגמאות, נתיב שונה לכל אחת
# -----------------------------------------------------------------------
if __name__ == "__main__":
    test_requests = [
        "מקפיא ראשי הושבת — סחורה בסיכון",                    # → incident
        "אירוע חברה ל-200 איש ביום חמישי — צריך לתאם",         # → event
        "מה כלול בתפריט ברירת המחדל לאירוע עסקי?",             # → query
        "צריך לבנות נוהל לפתיחת המטבח בבוקר",                  # → procedure
    ]

    for req in test_requests:
        dispatch(req)
        print()

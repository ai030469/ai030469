"""
Tools Agent
-----------
Agent עם גישה לכלים תפעוליים:
  - get_contacts      — שליפת אנשי קשר לפי תפקיד
  - send_message      — שליחת הודעה לממשק
  - create_task       — יצירת משימה במעקב
  - log_incident      — תיעוד תקלה

Claude מחליט בעצמו אילו כלים להפעיל ובאיזה סדר.

שימוש:
    python tools_agent.py
"""

import json
import anthropic

# -----------------------------------------------------------------------
# הגדרות
# -----------------------------------------------------------------------
MODEL = "claude-opus-4-6"
MAX_TOKENS = 16000

client = anthropic.Anthropic()


# -----------------------------------------------------------------------
# כלים — הגדרות JSON Schema
# -----------------------------------------------------------------------
TOOLS = [
    {
        "name": "get_contacts",
        "description": (
            "שולף רשימת אנשי קשר לפי תפקיד. "
            "תפקידים אפשריים: תפעול, הסעדה, טכנאים, ניקיון, תחזוקה, הנהלה."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "role": {
                    "type": "string",
                    "description": "תפקיד איש הקשר",
                    "enum": ["תפעול", "הסעדה", "טכנאים", "ניקיון", "תחזוקה", "הנהלה"],
                }
            },
            "required": ["role"],
        },
    },
    {
        "name": "send_message",
        "description": "שולח הודעה לממשק ספציפי.",
        "input_schema": {
            "type": "object",
            "properties": {
                "recipient": {"type": "string", "description": "שם הנמען או הקבוצה"},
                "channel": {
                    "type": "string",
                    "description": "ערוץ השליחה",
                    "enum": ["whatsapp", "email", "sms"],
                },
                "message": {"type": "string", "description": "תוכן ההודעה"},
            },
            "required": ["recipient", "channel", "message"],
        },
    },
    {
        "name": "create_task",
        "description": "יוצר משימת מעקב עם אחראי ותאריך יעד.",
        "input_schema": {
            "type": "object",
            "properties": {
                "title": {"type": "string", "description": "כותרת המשימה"},
                "owner": {"type": "string", "description": "אחראי המשימה"},
                "due": {"type": "string", "description": "תאריך יעד (YYYY-MM-DD)"},
                "priority": {
                    "type": "string",
                    "enum": ["גבוהה", "בינונית", "נמוכה"],
                },
            },
            "required": ["title", "owner", "priority"],
        },
    },
    {
        "name": "log_incident",
        "description": "מתעד תקלה תפעולית בלוג.",
        "input_schema": {
            "type": "object",
            "properties": {
                "type": {"type": "string", "description": "סוג התקלה"},
                "description": {"type": "string", "description": "תיאור התקלה"},
                "severity": {
                    "type": "string",
                    "enum": ["קריטי", "גבוה", "בינוני", "נמוך"],
                },
                "affected_areas": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "אזורים מושפעים",
                },
            },
            "required": ["type", "description", "severity"],
        },
    },
]


# -----------------------------------------------------------------------
# מימוש הכלים — כאן תחבר מערכות אמיתיות
# -----------------------------------------------------------------------
def get_contacts(role: str) -> dict:
    """
    בשלב זה מחזיר נתונים לדוגמה.
    חבר כאן ל-Google Contacts / CRM / קובץ אנשי קשר אמיתי.
    """
    contacts_db = {
        "תפעול": [{"שם": "דני לוי", "טלפון": "050-0000001", "מייל": "dani@ops.co"}],
        "הסעדה": [{"שם": "רונית כהן", "טלפון": "050-0000002", "מייל": "ronit@food.co"}],
        "טכנאים": [{"שם": "יוסי ביטון", "טלפון": "050-0000003", "מייל": "yossi@tech.co"}],
        "ניקיון": [{"שם": "חברת ניקיון", "טלפון": "050-0000004", "מייל": "clean@co.co"}],
        "תחזוקה": [{"שם": "אמיר דוד", "טלפון": "050-0000005", "מייל": "amir@maint.co"}],
        "הנהלה": [{"שם": "שרה מנהלת", "טלפון": "050-0000006", "מייל": "sara@hq.co"}],
    }
    return {"תפקיד": role, "אנשי_קשר": contacts_db.get(role, [])}


def send_message(recipient: str, channel: str, message: str) -> dict:
    """
    בשלב זה מדפיס לקונסול.
    חבר כאן ל-Twilio / SendGrid / WhatsApp API אמיתי.
    """
    print(f"\n  📤 [{channel.upper()}] → {recipient}:")
    print(f"  {message}")
    return {"סטטוס": "נשלח", "נמען": recipient, "ערוץ": channel}


def create_task(title: str, owner: str, priority: str, due: str = "") -> dict:
    """
    בשלב זה מחזיר אישור.
    חבר כאן ל-Notion / Asana / Google Tasks אמיתי.
    """
    task = {
        "id": f"TASK-{hash(title) % 10000:04d}",
        "כותרת": title,
        "אחראי": owner,
        "עדיפות": priority,
        "תאריך_יעד": due or "לא הוגדר",
        "סטטוס": "פתוח",
    }
    print(f"\n  ✅ משימה נוצרה: {task}")
    return task


def log_incident(
    type: str, description: str, severity: str, affected_areas: list = None
) -> dict:
    """
    בשלב זה מחזיר אישור תיעוד.
    חבר כאן ל-DB / Google Sheets / Airtable אמיתי.
    """
    incident = {
        "id": f"INC-{hash(description) % 10000:04d}",
        "סוג": type,
        "תיאור": description,
        "חומרה": severity,
        "אזורים_מושפעים": affected_areas or [],
        "סטטוס": "פתוח",
    }
    print(f"\n  🚨 תקלה תועדה: {incident}")
    return incident


# -----------------------------------------------------------------------
# ניתוב קריאות לכלים
# -----------------------------------------------------------------------
def execute_tool(tool_name: str, tool_input: dict) -> str:
    if tool_name == "get_contacts":
        result = get_contacts(**tool_input)
    elif tool_name == "send_message":
        result = send_message(**tool_input)
    elif tool_name == "create_task":
        result = create_task(**tool_input)
    elif tool_name == "log_incident":
        result = log_incident(**tool_input)
    else:
        result = {"שגיאה": f"כלי לא מוכר: {tool_name}"}

    return json.dumps(result, ensure_ascii=False)


# -----------------------------------------------------------------------
# Agent Loop — Claude מפעיל כלים עד שסיים
# -----------------------------------------------------------------------
def run_agent(user_request: str) -> str:
    """
    מריץ את ה-agent עד שאין יותר קריאות לכלים.
    מחזיר את התשובה הסופית.
    """
    print(f"\n{'='*60}")
    print(f"בקשה: {user_request}")
    print(f"{'='*60}")

    messages = [{"role": "user", "content": user_request}]

    while True:
        response = client.messages.create(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            tools=TOOLS,
            system=(
                "אתה סוכן תפעולי. "
                "השתמש בכלים הזמינים כדי לבצע את הבקשה במלואה. "
                "אל תשאל שאלות — פעל לפי הנתונים שיש לך. "
                "בסיום — סכם מה בוצע."
            ),
            messages=messages,
        )

        # אם Claude סיים — שלוף תשובה סופית
        if response.stop_reason == "end_turn":
            final = next(
                (b.text for b in response.content if b.type == "text"), ""
            )
            print(f"\n[סיכום Agent]\n{final}")
            return final

        # אחרת — Claude רוצה להפעיל כלים
        messages.append({"role": "assistant", "content": response.content})

        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                print(f"\n  🔧 מפעיל כלי: {block.name} | קלט: {block.input}")
                result = execute_tool(block.name, block.input)
                tool_results.append(
                    {
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": result,
                    }
                )

        messages.append({"role": "user", "content": tool_results})


# -----------------------------------------------------------------------
# הרצה
# -----------------------------------------------------------------------
if __name__ == "__main__":
    # החלף בכל בקשה תפעולית
    REQUEST = (
        "מקפיא ראשי הושבת. "
        "תעד את התקלה, שלח הודעה לטכנאים ולתפעול, "
        "וצור משימת מעקב על תיקון המקפיא בעדיפות גבוהה."
    )

    run_agent(REQUEST)

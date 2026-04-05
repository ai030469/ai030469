"""
MCP Agent
---------
Agent שמתחבר לשרתי MCP (Model Context Protocol) חיצוניים.
MCP מאפשר לחבר Claude לכלים חיצוניים כמו:
  - Google Drive / Sheets
  - Notion
  - Slack
  - כל שרת MCP מותאם אישית

בקובץ זה: MCP שרת לוקאלי מדומה (Filesystem) + הדגמת Webhook.

שימוש:
    pip install anthropic mcp
    python mcp_agent.py
"""

import asyncio
import json
import anthropic
from pathlib import Path

# -----------------------------------------------------------------------
# הגדרות
# -----------------------------------------------------------------------
MODEL = "claude-opus-4-6"
MAX_TOKENS = 16000

client = anthropic.Anthropic()

# -----------------------------------------------------------------------
# סימולציה של MCP Tool — Filesystem (קריאה/כתיבה לקבצים)
# -----------------------------------------------------------------------
# בפרויקט אמיתי: תחבר שרת MCP אמיתי כמו:
#   npx @modelcontextprotocol/server-filesystem /path/to/dir
#   npx @modelcontextprotocol/server-google-drive
#   npx @notionhq/notion-mcp-server

MCP_TOOLS = [
    {
        "name": "mcp_read_file",
        "description": (
            "קורא קובץ מהמערכת. "
            "משמש לקריאת נהלים, דוחות, קבצי תצורה."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "נתיב מלא לקובץ"}
            },
            "required": ["path"],
        },
    },
    {
        "name": "mcp_write_file",
        "description": "כותב תוכן לקובץ — יוצר או מחליף.",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "נתיב לקובץ"},
                "content": {"type": "string", "description": "תוכן לכתיבה"},
            },
            "required": ["path", "content"],
        },
    },
    {
        "name": "mcp_list_files",
        "description": "מציג רשימת קבצים בתיקייה.",
        "input_schema": {
            "type": "object",
            "properties": {
                "directory": {"type": "string", "description": "נתיב תיקייה"}
            },
            "required": ["directory"],
        },
    },
    {
        "name": "mcp_webhook",
        "description": (
            "שולח Webhook לשרת חיצוני — Zapier, Slack, Notion, Google Sheets. "
            "משמש לעדכון מערכות חיצוניות באופן אוטומטי."
        ),
        "input_schema": {
            "type": "object",
            "properties": {
                "url": {"type": "string", "description": "כתובת Webhook"},
                "payload": {
                    "type": "object",
                    "description": "נתונים לשליחה (JSON)",
                },
                "service": {
                    "type": "string",
                    "description": "שם השירות",
                    "enum": ["zapier", "slack", "notion", "sheets", "custom"],
                },
            },
            "required": ["url", "payload", "service"],
        },
    },
]


# -----------------------------------------------------------------------
# מימוש כלי MCP
# -----------------------------------------------------------------------
def mcp_read_file(path: str) -> dict:
    """
    קורא קובץ אמיתי מהדיסק.
    """
    try:
        content = Path(path).read_text(encoding="utf-8")
        return {"path": path, "content": content, "status": "ok"}
    except FileNotFoundError:
        return {"error": f"קובץ לא נמצא: {path}"}
    except Exception as e:
        return {"error": str(e)}


def mcp_write_file(path: str, content: str) -> dict:
    """
    כותב קובץ לדיסק.
    """
    try:
        p = Path(path)
        p.parent.mkdir(parents=True, exist_ok=True)
        p.write_text(content, encoding="utf-8")
        return {"path": path, "status": "נכתב בהצלחה", "bytes": len(content)}
    except Exception as e:
        return {"error": str(e)}


def mcp_list_files(directory: str) -> dict:
    """
    מציג קבצים בתיקייה.
    """
    try:
        files = [str(f) for f in Path(directory).iterdir()]
        return {"directory": directory, "files": files, "count": len(files)}
    except Exception as e:
        return {"error": str(e)}


def mcp_webhook(url: str, payload: dict, service: str) -> dict:
    """
    שולח Webhook.
    בשלב זה: מדפיס לקונסול + מחזיר אישור.
    בפרויקט אמיתי: השתמש ב-httpx / requests לשליחה אמיתית.

    דוגמה לשליחה אמיתית:
        import httpx
        response = httpx.post(url, json=payload, timeout=10)
        return {"status": response.status_code, "body": response.text}
    """
    print(f"\n  🌐 Webhook → {service.upper()} | URL: {url}")
    print(f"  Payload: {json.dumps(payload, ensure_ascii=False, indent=2)}")
    return {
        "service": service,
        "status": "נשלח (סימולציה)",
        "payload_keys": list(payload.keys()),
    }


# -----------------------------------------------------------------------
# ניתוב קריאות MCP
# -----------------------------------------------------------------------
def execute_mcp_tool(tool_name: str, tool_input: dict) -> str:
    if tool_name == "mcp_read_file":
        result = mcp_read_file(**tool_input)
    elif tool_name == "mcp_write_file":
        result = mcp_write_file(**tool_input)
    elif tool_name == "mcp_list_files":
        result = mcp_list_files(**tool_input)
    elif tool_name == "mcp_webhook":
        result = mcp_webhook(**tool_input)
    else:
        result = {"error": f"כלי MCP לא מוכר: {tool_name}"}

    return json.dumps(result, ensure_ascii=False)


# -----------------------------------------------------------------------
# MCP Agent Loop
# -----------------------------------------------------------------------
def run_mcp_agent(user_request: str) -> str:
    """
    Agent עם גישה לכלי MCP.
    מריץ לולאה עד שהמשימה הושלמה.
    """
    print(f"\n{'='*60}")
    print(f"בקשה: {user_request}")
    print(f"{'='*60}")

    messages = [{"role": "user", "content": user_request}]

    while True:
        response = client.messages.create(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            tools=MCP_TOOLS,
            system=(
                "אתה סוכן MCP תפעולי. "
                "יש לך גישה לקבצים ולמערכות חיצוניות דרך Webhooks. "
                "פעל לפי הבקשה במלואה — קרא, כתוב, שלח. "
                "בסיום — סכם מה בוצע."
            ),
            messages=messages,
        )

        if response.stop_reason == "end_turn":
            final = next(
                (b.text for b in response.content if b.type == "text"), ""
            )
            print(f"\n[סיכום MCP Agent]\n{final}")
            return final

        messages.append({"role": "assistant", "content": response.content})

        tool_results = []
        for block in response.content:
            if block.type == "tool_use":
                print(f"\n  🔌 MCP: {block.name} | {block.input}")
                result = execute_mcp_tool(block.name, block.input)
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
    # דוגמה 1: קריאת נוהל מקובץ ושליחתו ל-Slack
    REQUEST = (
        "קרא את הקובץ procedures.md, "
        "שלח Webhook ל-Zapier עם תוכן הנהלים, "
        "ואחר כך צור קובץ summary.md עם סיכום קצר של הנהלים."
    )

    run_mcp_agent(REQUEST)

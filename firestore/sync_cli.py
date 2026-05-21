"""CLI-Einstieg: python -m firestore.sync pull|push|sync"""

import sys
from loguru import logger
from . import pull, push

def main():
    logger.remove()
    logger.add(sys.stderr, format="<level>{level.icon}</level> {message}")
    cmd = sys.argv[1] if len(sys.argv) > 1 else "sync"
    if cmd == "pull":
        r = pull()
        logger.success(f"pull — sessions {r['sessions']} · journal {r['journal']}")
    elif cmd == "push":
        r = push()
        logger.success(f"push — sessions {r['sessions']}")
    elif cmd == "sync":
        r1 = pull()
        r2 = push()
        logger.success(f"sync — ↓ sessions {r1['sessions']} journal {r1['journal']}  ↑ sessions {r2['sessions']}")
    else:
        logger.error(f"Unbekannter Befehl: {cmd}  (pull|push|sync)")
        sys.exit(1)

if __name__ == "__main__":
    main()

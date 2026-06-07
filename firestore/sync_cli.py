"""CLI-Einstieg: python -m firestore.sync pull|push|sync"""

import sys

from rich.console import Console

from . import pull, push

console = Console()


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else "sync"
    if cmd == "pull":
        with console.status("[bold blue]Pulling from Firestore..."):
            r = pull()
        console.print(
            f"[bold green]✓ pull[/bold green] — sessions {r['sessions']} · journal {r['journal']} · inbox {r['inbox']}"
        )
    elif cmd == "push":
        with console.status("[bold blue]Pushing to Firestore..."):
            r = push()
        console.print(f"[bold green]✓ push[/bold green] — sessions {r['sessions']}")
    elif cmd == "sync":
        with console.status("[bold blue]Syncing Firestore..."):
            r1 = pull()
            r2 = push()
        console.print(
            f"[bold green]✓ sync[/bold green] — ↓ sessions {r1['sessions']} journal {r1['journal']} inbox {r1['inbox']}  ↑ sessions {r2['sessions']}"
        )
    else:
        console.print(f"[bold red]Unbekannter Befehl:[/bold red] {cmd}  (pull|push|sync)")
        sys.exit(1)


if __name__ == "__main__":
    main()

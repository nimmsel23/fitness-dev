# CI-Agent — offener Betriebspunkt

- [ ] `GEMINI_API_KEY` und `SYNC_TOKEN` als Actions-Secrets fuer diesen Repo-Zweig einrichten/prüfen; einen absichtlich roten Check bis zum grünen Promote/Deploy beobachten.



## Gemini CI-Agent — verbleibende Betriebsprüfung

- [ ] Einen echten roten, code-behebbaren CI-Lauf beobachten und bestätigen, dass Reparatur-Commit, grüner Check und vorgesehener Promote/Deploy enden.
- [ ] Fehler außerhalb des Codes (fehlende Deploy-Credentials, externe Dienste, Runner-Ausfälle) separat als Diagnose melden; keine ungeprüften Änderungen an Secrets oder Deploy-Konfiguration.

# Fitness Buglist
**if solved then prune list and mark date as done, always commit changes**

---
## 15-07-2026
---
in Firebase App werden keine Exercises gefunden mehr.
 - Journal neue version (vermutlich direkt import aus journal-dev beimm build) no entries. 
 	- journal-vos.web.app selbst login probleme + app reload probleme seit setup tab rausgenommen wurde. (fuel origin) (dayone style umbau)
 	- fitness-dev würde eigentlich von seiner eigenen implementation profitieren. Bzw ist ein dedizierter Journal-Tab eigentlich nicht nötig da der Fitness-User-Datenstand selbst das Journal bildet bzgl Fitness-Kontext.
 	- journal-dev selbst muss aber alle journale aggregieren können (fuel, fitness, relax). das schafft es einfach nicht obwohl alle im selben firestore liegen.
 	- eventuell liegt der fehler dort dass man in firestore nicht erst unter fitness nutrition relax einordnen sondern direkt unter den user uid einordnen sollte und erst dann nach app-kontext, dann kann man auch den user-context saueber anlegen!!

---
catalog-ui/ weiß nicht ob fertig written (möglicherweise auf worktree)

---

Die Workout-Routine sind die Habits die Fitness trackt eigentlich! der standalone Habit Tracker ist actually schon wieder eine micro app, der mechanismus des habit tracking sollte jedoch wie auch das journaling eine kern-komponente in der db sein, weniger ein separater Tab der wie eine 2. App in der App wirkt.

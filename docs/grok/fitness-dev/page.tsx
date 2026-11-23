import {
  BackToTop,
  BulletList,
  Callout,
  Metrics,
  Page,
  Properties,
  Rows,
  Section,
  Status,
  Table,
  TableOfContents,
  Text,
  TextLink,
} from "cursor/pages";

const AS_OF = "23 November 2026, 07:00 Europe/Vienna";

export default function FitnessDevDashboard() {
  return (
    <Page
      title="Fitness Dev Dashboard"
      summary={`Snapshot as of ${AS_OF}. Fitness DEV Bot area: fitness-dev (main), 6pack-dev, skills-dev, plan-dev, coach-dev, and their VitalOS shell pins. Feature freeze until 7 February 2027, except approved work and bugfixes. This page is a point-in-time readout, not a live feed.`}
      width="wide"
      sources={[
        "GitHub API, read-only, via cursor-github: nimmsel23/fitness-dev, 6pack-dev, skills-dev, plan-dev, coach-dev, vitalos, vos",
        "vitalos issues #27–#33 and vos/org (no DASHBOARDS.md on main or on branch cursor/fitness-dashboard-daily-6654)",
        "fitness-dev .github/workflows/deploy-master.yml (live URL https://fitness-aos.web.app)",
        "list_check_runs_for_ref on default-branch and open-PR heads; list_workflow_runs for deploy-master.yml, automerge.yml, check.yml, and deploy-miniapps run 43225387762",
      ]}
    >
      <TableOfContents
        items={[
          { label: "Features in progress", id: "features" },
          { label: "Open PRs and CI", id: "prs" },
          { label: "Live state and deploys", id: "live" },
          { label: "Recently merged", id: "merged" },
          { label: "Blockers and risks", id: "blockers" },
          { label: "Interfaces", id: "interfaces" },
        ]}
      />

      <Callout tone="info" lead="How this sits with work already under way">
        None of vitalos issues #27–#33 is a Fitness, 6Pack, or Skills dashboard.
        The closest are #32 (vitalos meta: shell, store, CI, and submodule pins including fitness, 6pack, skills, and plan) and #33 (coach-dev product health). This page does not replace those boards; it covers the Fitness DEV Bot area and only points at the VitalOS pins and the coach default branch.
        A PM-Dev dashboard in ChatGPT Work also exists; this bot cannot open it, so nothing about its contents is assumed here.
        Separately, vos pull request #9 ("Fitness-Dashboard täglich auf Firebase hosten", branch cursor/fitness-dashboard-daily-6654, base main, not a draft) would publish a daily counter-only page at https://vos-dashboard.web.app. That pull request is still open and is not live. This Page is the narrative board for the same area, not a second copy of that generator.
      </Callout>

      <Metrics
        metrics={[
          { value: "0", label: "Open pull requests", detail: "fitness-dev, 6pack-dev, skills-dev, plan-dev, coach-dev, vitalos" },
          { value: "11", label: "Open issues (5 repos)", detail: "fitness-dev 2 (#117, #121), 6pack-dev 2 (#52, #53), skills-dev 2 (#23, #24), coach-dev 5, plan-dev 0", tone: "warning" },
          { value: "8 / 6 / 2 / 0 / 0", label: "Merges, last 7 days", detail: "fitness / 6pack / skills / plan / coach (vitalos: 11); window since 16.11." },
          { value: "Live deploy RED", label: "fitness-aos.web.app", detail: "Live Deploy (Fitness master) failed on 34c0f49 and 81dadb2 (21.11. 22:02–22:05 Vienna); last success 78fcd6b, 17.11. Check/promote on master green 23.11.", tone: "danger" },
        ]}
      />

      <Section heading="Features in progress" id="features">
        <Text>
          The Skills classic redesign (<TextLink href="https://github.com/nimmsel23/skills-dev/issues/23">skills-dev#23</TextLink>) is still open as an issue, while its draft <TextLink href="https://github.com/nimmsel23/skills-dev/pull/22">skills-dev#22</TextLink> was closed on 12.11. 23:14 Vienna (merged). Owner approval of the look is the remaining acceptance step; not re-verified in this pass.
        </Text>
        <Text>
          Skills legal pages (<TextLink href="https://github.com/nimmsel23/skills-dev/pull/20">skills-dev#20</TextLink> and issue #19) are closed since 12.11./13.11. fitness-dev#104 (red Check, diverged master) is closed since 13.11. 03:27 Vienna. Open: the 6Pack runner covering the shell nav during a workout (no PR seen). No open pull requests in any of the six repos at read time.
        </Text>
      </Section>

      <Section heading="Open PRs and CI" id="prs" caption="Read 16.11. around 07:00 Vienna via GitHub search (is:open) and list_check_runs_for_ref on default branches.">
        <Text>No open pull requests in fitness-dev, 6pack-dev, skills-dev, plan-dev, coach-dev, or vitalos.</Text>
        <Table
          columns={["Repo", "Default branch", "Checks on current head"]}
          rows={[
            ["fitness-dev", "master", <Status tone="success">All green (check, deploy_live, promote, merge)</Status>],
            ["6pack-dev", "master", <Status tone="warning">Green; Dependabot runs failed 17.11. 17:07 Vienna</Status>],
            ["skills-dev", "master", <Status tone="warning">Green on 18.11.; one deploy check failed 17.11. 17:06 Vienna</Status>],
            ["plan-dev", "master", <Status tone="success">All green</Status>],
            ["coach-dev", "dev (default)", <Status tone="success">All green</Status>],
            ["vitalos", "master", <Status tone="success">smoke, deploy ×2 green (only 3 runs returned)</Status>],
          ]}
        />
      </Section>

      <Section heading="Live state and deploys" id="live">
        <Properties
          items={[
            { label: "Fitness live URL", value: <TextLink href="https://fitness-aos.web.app">https://fitness-aos.web.app</TextLink> },
            { label: "Last live deploy", value: <>Live Deploy (Fitness master) on 81dadb2: failure, 21.11. 22:05 Vienna (<TextLink href="https://github.com/nimmsel23/fitness-dev/actions/runs/44949654883">run</TextLink>); also failed on 34c0f49. Last success: 78fcd6b, 17.11. 18:00 Vienna. Tracked in <TextLink href="https://github.com/nimmsel23/fitness-dev/issues/121">fitness-dev#121</TextLink>.</> },
            { label: "Auto-Promote", value: "Latest runs on 81dadb2 succeeded (23.11. 02:59 Vienna)." },
            { label: "Mini-App tabs", value: "Latest Live Deploy (Mini-Apps je Tab) run is success on 99f62f2 (12.11. 14:42 Vienna) after the 37e7706 failure, fixed by fitness-dev#106. Not re-run since." },
            { label: "Check (Fitness)", value: "Last run success on 84fcea5 (15.11. 07:37 Vienna); a failure on 96f5332 (14.11.) was followed by green." },
          ]}
        />
      </Section>

      <Section heading="Recently merged" id="merged" caption="Window: merged at or after 9 November 2026 (UTC date). Counts include dependency PRs.">
        <Table
          columns={["Merged (UTC)", "PR", "Title"]}
          rows={[
            ["15.11. 14:58", <TextLink href="https://github.com/nimmsel23/skills-dev/pull/25">skills-dev#25</TextLink>, "fix(ci): 6Pack-Daten generieren; Promote/Deploy nur bei grünem Check"],
            ["14.11. 06:41", <TextLink href="https://github.com/nimmsel23/vitalos/pull/42">vitalos#42</TextLink>, "chore(submodules): fitness-app pin bump"],
            ["12.11. 22:14", <TextLink href="https://github.com/nimmsel23/skills-dev/pull/22">skills-dev#22</TextLink>, "Calm classic Skills design"],
            ["12.11. 14:16", <TextLink href="https://github.com/nimmsel23/fitness-dev/pull/107">fitness-dev#107</TextLink>, "fix(ci): Check ohne rekursive journal-app Submodule"],
            ["12.11. 13:42", <TextLink href="https://github.com/nimmsel23/fitness-dev/pull/106">fitness-dev#106</TextLink>, "fix(ci): Fitness-KB im Mini-App-Tab-Deploy"],
            ["12.11. 13:14", <TextLink href="https://github.com/nimmsel23/fitness-dev/pull/105">fitness-dev#105</TextLink>, "Plain 6Pack and Skills labels inside the VitalOS shell"],
            ["12.11. 13:06", <TextLink href="https://github.com/nimmsel23/6pack-dev/pull/46">6pack-dev#46</TextLink>, "VitalOS shell embed"],
          ]}
        />
        <Text>Totals since 9.11.: fitness-dev 13, 6pack-dev 8, skills-dev 5, plan-dev 0, coach-dev 6, vitalos 17.</Text>
      </Section>

      <Section heading="Blockers and risks" id="blockers">
        <Rows
          rows={[
            { title: "Fitness live deploy red (fitness-dev#121)", lead: "Own area", detail: "Live Deploy (Fitness master) failing since 21.11. on 34c0f49 and 81dadb2; master checks and promote are green. Cause not analysed in this pass.", status: { label: "Red", tone: "danger" } },
            { title: "skills-dev#24 and #26 still open", lead: "Own area", detail: "Check/Live Deploy red (sixpackData.gen) and a dashboard-status issue, both from 15.11. The fix #25 merged 15.11. 15:58 Vienna and master checks are green now; issues await closure.", status: { label: "Verify", tone: "warning" } },
            { title: "VitalOS pins behind masters", lead: "Interface", detail: "skills-app and fitness-app pins are behind their masters (see Interfaces). 6pack-app and plan-app match.", status: { label: "Drift", tone: "warning" } },
            { title: "6Pack runner covers the shell nav", lead: "Own area", detail: "Seen in the shell browser test. No fix pull request open.", status: { label: "Open", tone: "warning" } },
            { title: "Feature freeze until 7 February 2027", lead: "Policy", detail: "Except approved work and bugfixes. New ideas go to CPO Bot (Fridays).", status: { label: "In force" } },
          ]}
        />
      </Section>

      <Section heading="Interfaces" id="interfaces">
        <Text>VitalOS shell pins (nimmsel23/vitalos master) vs. each repo's master, read 16.11.</Text>
        <Table
          columns={["Shell path", "Source repo", "Pinned SHA", "Master head", "Match"]}
          rows={[
            ["6pack-app", "6pack-dev", "51bbdc7f", "51bbdc7f", <Status tone="success">In sync</Status>],
            ["skills-app", "skills-dev", "6098a12a", "422fe84f", <Status tone="warning">Behind</Status>],
            ["plan-app", "plan-dev", "d4181a86", "d4181a86", <Status tone="success">In sync</Status>],
            ["fitness-app", "fitness-dev", "9c2e87a4", "84fcea54", <Status tone="warning">Behind</Status>],
          ]}
        />
      </Section>

      <Section heading="Open issues" id="issues">
        <Table
          columns={["Issue", "Title"]}
          rows={[
            [<TextLink href="https://github.com/nimmsel23/fitness-dev/issues/121">fitness-dev#121</TextLink>, "Dashboard-Lage: rot (Live Deploy)"],
            [<TextLink href="https://github.com/nimmsel23/6pack-dev/issues/53">6pack-dev#53</TextLink>, "Runner-Overlay überdeckt die VitalOS-Shell"],
            [<TextLink href="https://github.com/nimmsel23/fitness-dev/issues/117">fitness-dev#117</TextLink>, "ci: dev nach Squash von #116 wieder mit master verbinden (Promote rot)"],
            [<TextLink href="https://github.com/nimmsel23/skills-dev/issues/24">skills-dev#24</TextLink>, "[fitness] Check + Live Deploy rot: sixpackData.gen"],
            [<TextLink href="https://github.com/nimmsel23/skills-dev/issues/23">skills-dev#23</TextLink>, "Classic design: understated major redesign"],
          ]}
        />
        <Text>Open issues read 23.11.: fitness-dev 2, 6pack-dev 2 (#52, #53), skills-dev 2, coach-dev 5 (Ausbaustufen #22–#29), plan-dev 0. vitalos has 11 more.</Text>
      </Section>

      <Section heading="Refresh" id="refresh">
        <BulletList
          items={[
            "This Page is a snapshot. Fitness DEV Bot should refresh it at least daily, or after a merge or a CI change, by re-reading GitHub and editing the Page.",
            "The intended self-updating public board is vos#9 (daily GitHub Action to Firebase). It is not merged, and vos/org/DASHBOARDS.md does not exist on vos main or on the vos#9 branch, so no registry line was added.",
          ]}
        />
      </Section>

      <BackToTop />
    </Page>
  );
}

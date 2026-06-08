# Runbook: Incident response

## Severity

- **SEV1** money moves incorrectly, data breach, full outage.
- **SEV2** a core loop step is broken (cannot bid, hire, submit, pay).
- **SEV3** degraded but usable (slow, one non-core page down).

## First 15 minutes

1. Declare severity in the team channel. One person owns the incident.
2. Check `/admin/ops` for integration health and the reconciliation panel.
3. Check Sentry for the error spike; grab the digest/trace id.
4. If money or PII is involved, treat as SEV1 and stop the affected flow
   (feature-flag it off via the relevant `services.<flag>` or a kill
   switch) before debugging.

## DPDP breach path (PII involved)

DPDP requires breach notice **without delay** to affected users and an
initial intimation to the Data Protection Board, with a detailed report
**within 72 hours**. There is no materiality threshold: any personal-data
breach is reportable.

1. Contain: revoke keys, rotate secrets, disable the leaking path.
2. Notify the grievance officer (privacy@stuviora.com) immediately.
3. Draft the user notice (what data, what risk, what to do).
4. File the Board intimation; complete the detailed report within 72h.

## Recovery

- Restore the path behind the flag once verified in staging.
- Write a postmortem: timeline, root cause, the one prevention that would
  have caught it. File any new reconciler/alert it implies.

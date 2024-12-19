RETROSPECTIVE SPRINT 4 (Team 12)
=====================================

Retrospective index:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES

### Macro statistics

- Number of stories committed vs. done 
  - The number of stories committed is 5.
  - The number of stories completed is 5.


- Total points committed vs. done
  - The number of points committed is 8 (KX10) + 3 (KX11) + 3 (KX14) + 5 (KX19) + 1 (KX20) = 20.
  - The number of points done is 20.


- Nr of hours planned vs. spent (as a team)

  - The number of hours planned is 112h 15m.
  - The number of hours spent is 114h 35m .

**Remember**  a story is done ONLY if it fits the Definition of Done:

- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

### Detailed statistics

| Story | # Tasks | Points | Hours est. | Hours actual |
|-------|---------|--------|------------|--------------|
| _#0_  | 21      | -      | 70h 15m    | 71h 30m      |
| KX10  | 5       | 8      | 10h        | 12h 25m      |
| KX11  | 3       | 3      | 5h 30m     | 6h 30m       |
| KX14  | 3       | 3      | 6h         | 7h           |
| KX19  | 10      | 5      | 17h 30m    | 14h 10m      | 
| KX20  | 4       | 1      | 3h         | 3h           |

- Hours per task average, standard deviation (estimate and actual)

|            | Mean  | StDev |
|------------|-------|-------|
| Estimation | 2,44  | 2,44  | 
| Actual     | 2,491 | 2,41  |

- Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1

  $$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1 = 0.02$$

- Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n

  $$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_task_i}-1 \right| = 0.08$$

## QUALITY MEASURES

- Unit Testing:
  - Total hours estimated: **5h**
  - Total hours spent: **6h**
  - Nr of automated unit test cases: **170**
  - Coverage (if available): 97.10%
- E2E testing:
  - Total hours estimated: **10h 30m**
  - Total hours spent: **13h 15m**
- Code review
  - Total hours estimated: **12h**
  - Total hours spent: **12h**
- Technical Debt management:
  - Strategy adopted: **only one person from the team improves the code**
  - Total hours estimated at sprint planning: **4h**
  - Total hours spent: **3h30m**

## ASSESSMENT

- **What caused your errors in estimation (if any)?**
  - In this sprint we underestimated the time for testing, especially end-to-end testing, while also overestimating the time needed to implement and integrate some features in story 14. We had the last demo this sprint, so we performed more tests than usual to make sure the application worked perfectly. 

- **What lessons did you learn (both positive and negative) in this sprint?**

  - ***Positive Lessons***:

    1. **Teamwork**: Like in the previous sprints, we saw how well we work together as a team, helping each other when needed, and giving feedback (positive and negative) on new features or UIs.

  - ***Negative Lessons***:

    1. **Delayed task progress**: Like during the previous sprint, some team members assigned themselves to tasks but did not start working on them until the last days before the demo. Fortunately, though, this time the late tasks mainly concerned testing or minor adjustments, so they didn't have much of an impact on the overall progress.


- **Which improvement goals set in the previous retrospective were you able to achieve?**

  1. **Time management**: it was our only main goal for this sprint. We finally managed to implement every necessary feature well before the date of the demo, leaving ample time to thoroughly test the whole system.


- **Which ones you were not able to achieve? Why?**

  1. **Task assignments**: we still had tasks that were assigned at the beginning of the sprint and then were not worked on for a long time.


- **Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)**

  - Since this is the last sprint, we don't really have any goal in mind. But should we ever work together again in the future, we hope to be able to better manage our time and try to assign ourselves to tasks that we know we can complete in due time.

- **One thing you are proud of as a Team!!**

  - We are really proud of delivering (what we like to think as) a good quality product. We put some good effort in this project, and we are proud of how far we have managed to come in just a couple of months of development.
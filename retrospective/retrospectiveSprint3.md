RETROSPECTIVE SPRINT 3 (Team 12)
=====================================

Retrospective index:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs. done 
> The number of stories committed is 4.
> The number of stories completed is 4.
- Total points committed vs. done 
> The number of points committed is 3 (KX6) + 5 (KX7) + 5 (KX8) + 5 (KX9) = 18.
> The number of points done is 18.
- Nr of hours planned vs. spent (as a team)
> The number of hours planned is 112h.
> The number of hours spent is 115h 25m.

**Remember**  a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

> Please refine your DoD 

### Detailed statistics

| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
|  _#0_  |    16   |   -    |  51h 30m   |     56h      |
|  KX6   |    4    |   3    |    5h      |    5h 15m    |
|  KX7   |    11   |   5    |    18h     |   21h 30m    |
|  KX8   |    10   |   5    |    17h     |   16h 30m    |
|  KX9   |    10   |   5    |  20h 30m   |   16h 10m    |
   

> place technical tasks corresponding to story `#0` and leave out story points (not applicable in this case)

- **Hours per task average, standard deviation (estimate and actual)**

   estimate hours per task average: 2h 2m

   actual hours per task average: 2h 3m

   estimed standard deviation: 2,177

   actual standard deviation: 2,360

- **Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1**


    $$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1 = \frac{115,42}{112} - 1 = 0,0305 $$ 
    
- **Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n**


    $$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_{task_i}}-1 \right| = \frac{1}{5} ( 0,0874 + 0,05 + 0,1944 + 0,2941 + 0,2114 ) = 0,1675  $$

 
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated: **10h 30m**
  - Total hours spent: **7h**
  - Nr of automated unit test cases: **278** 
  - Coverage (if available)
- E2E testing:
  - Total hours estimated: **7h**
  - Total hours spent: **4h 30m**
- Code review 
  - Total hours estimated: **6h**
  - Total hours spent: **6h**
- Technical Debt management:
  - Strategy adopted: **only one person from the team improves the code**
  - Total hours estimated estimated at sprint planning: **4h**
  - Total hours spent: **4h**
  


## ASSESSMENT

- **What caused your errors in estimation (if any)?**

   -This sprint we overestimated the time for testing and we underestimated the time for developing the frontend. As a result of gaining more experience with testing, we needed less time to do them. Also the implementation of some features in the frontend turned out to be more complicated then we initially thought. 

- **What lessons did you learn (both positive and negative) in this sprint?**

 ***Positive Lessons***:
 1. **Team feedback**: One of the key positive takeaways from this sprint was the value of open and constructive team feedback. Whenever a task was completed in a less efficient way, the quality of the code could be improved, or there was redundancy in the implementation, we openly shared feedback with each other. This collaborative approach helped us identify and address potential issues early. Similarly, if the user interface (UI) was confusing or not intuitive, we promptly discussed it and made necessary adjustments. This proactive feedback loop allowed us to improve the overall quality of our work and deliver better results as a team.

 ***Negative Lessons***:

 1. **Rushing work toward the end of the sprint**: We observed a tendency to leave significant portions of work until the last moment, which created unnecessary stress and impacted efficiency. Moving forward, we aim to distribute tasks more evenly throughout the sprint to maintain a steady workflow and reduce last-minute pressure.

 2. **Delayed task progress**: We noticed instances where team members assigned themselves to tasks but did not start working on them for several days. This caused delays in overall progress and impacted the sprint timeline. Going forward, we aim to improve accountability and ensure tasks are actively worked on soon after being assigned.

- **Which improvement goals set in the previous retrospective were you able to achieve?**
  
  1. **Better estimation for the time needed to integrate the frontend and backend**: In this sprint we correctly managed to estimate the time needed to integrate the frontend and backend.

  2. **Faster and better E2E and unit testing**: As a result of gaining more experience with testing, we have significantly improved our approach to both E2E and unit testing. With better familiarity and understanding of the testing processes, we were able to execute tests more efficiently and effectively.

- **Which ones you were not able to achieve? Why?**

  1. **Time management**: We need to improve our time management, as we found ourselves implementing features in the frontend at the very last moment again.

  2. **Last-minute code changes**: As a consequence of time management we ended up making changes to the code at the last minute, which required additional E2E testing to ensure everything 
  was working correctly.

- **Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)**

For the next sprint we should avoid last-minute task completion and aim to start working on tasks promptly after they are assigned. Also team members should only assign themselves to tasks when they are ready to start working on them. To address this, we can implement regular check-ins of the code during to ensure tasks are actively being worked on.

- **One thing you are proud of as a Team!!**

We are proud of how much we have grown as a team. We have learned to communicate effectively with each other, recognize and leverage our individual strengths, and address our weaknesses together. We’ve built a culture of giving both positive and constructive feedback, which has helped us improve continuously. Most importantly, we genuinely care about delivering a high-quality product and ensuring that our work reflects our collective dedication and effort

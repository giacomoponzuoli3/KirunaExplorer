RETROSPECTIVE SPRINT 2 (Team 12)
=====================================


Retrospective index:


- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)


## PROCESS MEASURES 


### Macro statistics


- Number of stories committed vs. done 
> The number of stories committed is 3.
> The number of stories completed is 3.
- Total points committed vs. done 
> The number of points committed is 3 (KX3) + 8 (KX4) + 5 (KX5) = 16.
> The number of points done is 16.
- Nr of hours planned vs. spent (as a team)
> The number of hours planned is 113h15m.
> The number of hours spent is 110h30m.

**Remember** a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed


> Please refine your DoD if required (you cannot remove items!) 


### Detailed statistics


| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
|  _#0_  |    17   |        |  60h 15m   |   65h 15m    |
|  KX3   |    8    |   3    |  20h 30m   |     21h      |
|  KX4   |    7    |   8    |    18h     |   15h 55m    |
|  KX5   |    6    |   5    |  14h 30m   |   11h 10m    |

> story `#0` is for technical tasks, leave out story points (not applicable in this case)


- **Hours per task average, standard deviation (estimate and actual)**

   estimate hours per task average: 3h 2m

   actual hours per task average: 3h

   estimed standard deviation: 3,813

   actual standard deviation: 3,691

- **Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1**


    $$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1 = \frac{110,5}{113,25} - 1 = -0,0243 $$ 
    
- **Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n**


    $$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_task_i}-1 \right| = \frac{1}{4} ( 0,0830 + 0,0244 + 0,1111 + 0,2414 ) = 0,1150  $$
  
## QUALITY MEASURES 
- Unit Testing:
  - Total hours estimated: **9h**
  - Total hours spent: **9h**
  - Nr of automated unit test cases: **268**
  - Coverage (if available)
- E2E testing:
  - Total hours estimated: **6h**
  - Total hours spent: **6h**
- Code review 
  - Total hours estimated: **5h**
  - Total hours spent: **5h**
  
## ASSESSMENT

- **What caused your errors in estimation (if any)?**

   We made fewer estimation errors than in the previous sprint, this time we estimate well the time for the testing, but we overestimated the time for other tasks (like integration the frontend and backend). It took less time than expected beacause frontend and backend were developed by the same person.

- **What lessons did you learn (both positive and negative) in this sprint?**

 ***Positive Lessons***:

  1. **Increased productivity**: In this sprint we commited 3 stories and we completed all of them well and on time, keeping the quality high.

  2. **Proper communication**: We had many comparisons on how to develop the frontend that helped to get a good result.

 ***Negative Lessons***:

 1. **Understimating the time required for the new icons**: We estimated too little time to choose new icons and implement them in the application.

  2. **Overstimating the time required for integration between Frontend and Backend**: We estimated too much time not taking into account that the development of the frontend and the backend was done by the same person.

- **Which improvement goals set in the previous retrospective were you able to achieve?**

  1. **Faster and better testing**: We have achived faster and better testing in this sprint, people who developed tests talked a lot with the developers of the backend.

- **Which ones you were not able to achieve? Why?**

  1. **Time management**: We need to try to start the review of the code a few days before the deadline, in this way we can do it with more calm.

- **Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)**

For the next sprint we should finish the most of the task few days before the deadline and avoid to rush the day before the demo. And also try to split better the 16h during the 2 weeks.

- **One thing you are proud of as a Team!!**

We did 3 stories and now the project is really taking shape and it's really nice, also the demo goes really well.

TEMPLATE FOR RETROSPECTIVE (Team 12)
=====================================


The retrospective should include _at least_ the following
sections:


- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)


## PROCESS MEASURES 


### Macro statistics


- Number of stories committed vs. done 
> The number of stories committed is 2.
> The number of stories completed is 2.
- Total points committed vs. done 
> The number of points committed is 5 (KX1) + 3 (KX2) = 8.
> The number of points done is 8.
- Nr of hours planned vs. spent (as a team)
> The number of hours planned is 112h.
> The number of hours spent is 120h 15m.

**Remember** a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed


> Please refine your DoD if required (you cannot remove items!) 


### Detailed statistics


| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
|  _#0_  |    11   |        |  68h 30m   |   70h 15m    |
|  KX1   |    9    |   5    |    24h     |     32h      |
|  KX2   |    7    |   3    |  19h 30m   |     18h      |


> story `#0` is for technical tasks, leave out story points (not applicable in this case)


- Hours per task average, standard deviation (estimate and actual)
- Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1


    $$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1 = \frac{120,25}{112} - 1 = 0,07366 $$ 
    
- Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n


    $$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_task_i}-1 \right| = \frac{1}{3} (0,0255 + 0,3333 + 0,0769 ) = 0,1452  $$
  
## QUALITY MEASURES 


- Unit Testing:
  - Total hours estimated: **7h**
  - Total hours spent: **9h**
  - Nr of automated unit test cases: **191**
  - Coverage (if available)
- E2E testing:
  - Total hours estimated: **4h**
  - Total hours spent: **4h**
- Code review 
  - Total hours estimated: **4h**
  - Total hours spent: **4h**
  




## ASSESSMENT


- **What caused your errors in estimation (if any)?**

   We made fewer estimation errors than in the previous sprint, but we still need to estimate better the time required for testing.

- **What lessons did you learn (both positive and negative) in this sprint?**

 ***Positive Lessons***:
1. **Improvement in our team comunication**: In this sprint we communicated better with each other so we were able to avoid possible mistakes in development of the project.

2. **Less working pressure**: We managed to had less anxiety and pressure about having all the tasks complited on time, in doing so we performed an higher quality work.

3. **Enhanced collaboration**: When a problem occured, we helped each other to resolve it.

 ***Negative Lessons***:

 1. **Understimating the time required for E2E testing**: We managed to correctly estimate the time required for unit tests, but we still need to spend more time on the E2E testing.

- **Which improvement goals set in the previous retrospective were you able to achieve?**
  
  1. **Implement and Testing the user stories in priority order**: In this sprint we correctly managed to implement and testing the user stories in priority order, starting from the user story with the higher business value.

  2. **Orginize our work better**: Choosing less stories and in priority order lead us to orginize our work better without any pressure on the time required for completing the tasks.

- **Which ones you were not able to achieve? Why?**

  1. **Time management**: We still need to manage our time better because we again had implementation and testing issues that emerged at the last minute.

  2. **Modify the code at the last minute**: As a consequence of time management we modified the code at the last minute and so we also needed to check everything again.

- **Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)**

For the next sprint we should improve our work for technical tasks (like testing) and avoid to have any problems at the last minute.

- **One thing you are proud of as a Team!!**

We done our tasks in a linear and consistent way and improved our ability to work as a team to achieve our goals.

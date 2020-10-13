### Metra API

- Azure live delpoloyment: https://metraapi.azurewebsites.net/
  - There currently is no desktop view.
  - To view the application please load on mobile or resize your browser to less than 376px wide.
    - If stops aren't populating in the departure dropdown, open the link in a new tab.


- Application allows users to input desired departure and destination stops.
  - SQL Procedures reference the Metra GTFS Static Schedule.
  - .NET processes data and specifies certain filters like date, destination and departure order, and stop coordinates
  - React maps the returned stops and displays to user.



- Metra GTFS Realtime and Static References: https://metrarail.com/developers




##### TODO:
  - Display trip postitioms on map, and show where the train is currently sitting.
  - Apply destination swap button. Need to alter component props without rerendering the page.
  - I haven't had much time to focus on UI, the current design is only temporary until I finish the backend functionality.

### Metra API

- Azure live delpoloyment: https://metraapi.azurewebsites.net/
- UI looks best under 1200px wide.
  - If stops aren't populating in the departure dropdown, open the link in a new tab.


- Application allows users to input desired departure and destination stops.
  - Azure SQL Procedures reference the Metra GTFS Static Schedule.
  - .NET processes data and specifies certain filters like date, destination and departure order, and stop coordinates
  - React maps the returned stops and displays to user.



- Metra GTFS Realtime and Static References: https://metrarail.com/developers



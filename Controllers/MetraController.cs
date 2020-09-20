using MetraApi.Models;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

// The main idea here is to use sql queries for the larger datasets (stop_times, routes) as they're 
// not likely to change. 

// Using http requests for smaller things like metra alerts, schedule announcements, or anything that is subject to update quickly


namespace MetraApi.Controllers
{
  [Route("metra")]
  [ApiController]
  public class MetraController : ControllerBase
  {
    static HttpClient client = new HttpClient();

    [HttpGet("stops")]
    public async Task<Dictionary<string, string>> RequestMetra()
    {
      client = Configurations.CreateHttpConnection(client);

      string url = "https://gtfsapi.metrarail.com/gtfs/schedule/stops";

      HttpResponseMessage response = await client.GetAsync(url);
      string responseContent = await response.Content.ReadAsStringAsync();

      List<MetraStop> stops = new List<MetraStop>();

      stops = JsonConvert.DeserializeObject<List<MetraStop>>(responseContent);

      // the stop_id is used to reference the stop times in the db
      Dictionary<string, string> stopNames = new Dictionary<string, string>();

      stops.ForEach(stop =>
      {
        stopNames.Add(stop.stop_id, stop.stop_name);

      });

      client.DefaultRequestHeaders.Remove("Authorization");

      return stopNames;
    }

    [HttpPost("destinations")]
    public Dictionary<string, string> GetDestinations([FromBody] object body)
    {
      // need to deserialize because the response can only come in as object
      Dictionary<string, string> departure = JsonConvert.DeserializeObject<Dictionary<string, string>>(body.ToString());

      // the static metra information contains a lot of tables. joins are very likely
      string query = @$"
        SELECT DISTINCT route_id

        FROM stop_times 
          JOIN trips ON stop_times.trip_id=trips.trip_id
          
        WHERE stop_id = '{departure.Values.First()}';
      ";

      string route_id = "";

      using (SqlConnection sqlConnection = Configurations.CreateSqlConnection())
      {
        sqlConnection.Open();
        SqlCommand routeIdCommand = new SqlCommand(query, sqlConnection);

        using (SqlDataReader reader = routeIdCommand.ExecuteReader())
        {
          while (reader.Read())
          {
            route_id = reader.GetString(0);

          }

        }
        // after using the stop id to find the route id, we can then get the possible destinations 
        // for the selected stop which will be displayed by the user

        string stopNamesQuery = $@"
          SELECT 
            DISTINCT stops.stop_id, stops.stop_name
          FROM stop_times 
            JOIN stops ON stop_times.stop_id = stops.stop_id

          WHERE trip_id LIKE '%{route_id}%';

        ";

        // like the first response, sending a dictionary with id and name, so the id can be used in furure queries
        Dictionary<string, string> stops = new Dictionary<string, string>();

        SqlCommand stopNamesCommand = new SqlCommand(stopNamesQuery, sqlConnection);
        using (SqlDataReader reader = stopNamesCommand.ExecuteReader())
        {
          while (reader.Read())
          {
            // sql data reader reads one string at a time, need to split into key value
            // other option was to check % 2 == 0, but i felt incrementing like this was easier with the dictionary
            for (int i = 0; i < reader.FieldCount; i += 2)
            {
              stops.Add(reader.GetString(i), reader.GetString(i + 1));
            }
          }
        }

        return stops;
      };
    }


    [HttpPost("stoptimes")]
    public List<MetraStopTime> GetTimesToday([FromBody] object body)
    {
      // body contains the departure id and destination id 

      Dictionary<string, string> stopIds = JsonConvert.DeserializeObject<Dictionary<string, string>>(body.ToString());

      JsonSerializer serializer = new JsonSerializer();

      using (SqlConnection connection = Configurations.CreateSqlConnection())
      {
        using (SqlCommand command = new SqlCommand("[dbo].[GetTimesToday]", connection))
        {
          command.CommandType = System.Data.CommandType.StoredProcedure;
          command.Parameters.AddWithValue("@departure", stopIds["selectedDestinationId"]);
          command.Parameters.AddWithValue("@destination", stopIds["selectedDepartureId"]);

          connection.Open();

          List<MetraStopsWithDays> metraStopsWithDays = new List<MetraStopsWithDays>();

          using (SqlDataReader reader = command.ExecuteReader())
          {
            while (reader.Read())
            {
              metraStopsWithDays.Add(new MetraStopsWithDays()
              {
                stop_id = reader.GetString(0),
                trip_id = reader.GetString(1),
                arrival_time = reader.GetString(2),
                stop_name = reader.GetString(3),
                stop_lat = reader.GetDouble(4),
                stop_lon = reader.GetDouble(5),
                zone_id = reader.GetString(6),
                service_id = reader.GetString(7),
                stop_sequence = reader.GetString(8),
                monday = reader.GetString(9),
                tuesday = reader.GetString(10),
                wednesday = reader.GetString(11),
                thursday = reader.GetString(12),
                friday = reader.GetString(13),
                saturday = reader.GetString(14),
                sunday = reader.GetString(15),

              });


            }
          }

          // Since one of the column is lagged into the next row, there will always be a null previous sequence on the first row
          MetraStopsWithDays null_previous = metraStopsWithDays.FirstOrDefault(s => s.previous_sequence == null);
          metraStopsWithDays.Remove(null_previous);

          // get the stops that have the selected departure and destination
          List<MetraStopsWithDays> stopsWithDestination = new List<MetraStopsWithDays>();
          List<MetraStopTime> finalStopInformation = new List<MetraStopTime>();

          // still need to filter a lot
          foreach (MetraStopsWithDays stop in metraStopsWithDays)
          {
            Console.WriteLine(metraStopsWithDays.IndexOf(stop));
            // splits the stops into destination and departure
            MetraStopsWithDays[] commonTrips = metraStopsWithDays.Where(s => s.trip_id == stop.trip_id).ToArray();

            // unfortunately the date data is stored in day of the week columns with bools
            // this gets the stops running today
            string today = DateTime.Today.DayOfWeek.ToString().ToLower();
            string runsToday = stop.GetType().GetProperty(today).GetValue(stop, null).ToString();


            if (runsToday == "1")
            {
              if (commonTrips.Count() > 1)
              {
                string formattedDepartureTime = "";
                string formattedDestinationTime = "";

                string formattedDepartureDate = "";
                string formattedDestinationDate = "";


                // some stops have a destination time of 25:20.. not sure why

                try
                {
                  formattedDepartureTime = DateTime.Parse(commonTrips[0].arrival_time).ToShortTimeString();
                  formattedDestinationTime = DateTime.Parse(commonTrips[1].arrival_time).ToShortTimeString();

                  formattedDepartureDate = DateTime.Parse(commonTrips[0].arrival_time).ToShortDateString();
                  formattedDestinationDate = DateTime.Parse(commonTrips[1].arrival_time).ToShortDateString();

                }
                catch
                {
                  // if a time is something like 25:45, we can just ignore it 
                  continue;
                }

                string currentTime = DateTime.Now.ToShortTimeString();

                // compare the first hours of the departure time and current time. 
                // destination could be 2 am in the next morning so we dont want to compare it
                int currentHour = 0;
                int departureHour = 0;
                  currentHour = int.Parse(currentTime.Split(':')[0]);
                  departureHour = int.Parse(formattedDepartureTime.Split(':')[0]);


                if(currentHour <= departureHour)
                {
                  finalStopInformation.Add(new MetraStopTime()
                  {
                    trip_id = commonTrips[0].trip_id,

                    departure_id   = commonTrips[0].stop_id,
                    departure_name = commonTrips[0].stop_name,
                    departure_time = formattedDepartureTime,
                    departure_date = formattedDepartureDate,


                    destination_id   = commonTrips[1].stop_id,
                    destination_name = commonTrips[1].stop_name,
                    destination_time = formattedDestinationTime,
                    destination_date = formattedDestinationDate,

                  });

                }


              }

            }

          }

          connection.Close();


          // this gives us distinct times
          return finalStopInformation.GroupBy(x => x.departure_time)
                                     .Select(group => group.First())
                                     .ToList();



        }
      }

    }

  }
}
